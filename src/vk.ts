// VK-транспорт и исполнение реакций. Реакции берутся из ./reactions — общий модуль
// с Telegram, поэтому бот в VK отвечает ровно так же, как в Telegram.
import { VK } from 'vk-io';
import { Reaction, ReactionVariants, ReactionInfo, analyze, pickReaction } from './reactions';
import { boobs, borisich, butts, giphy, oboobs, obutts, oleg, nooleg, skipFriday } from './variants';

const variants: ReactionVariants = { skipFriday, boobs, butts, oleg, nooleg, borisich };

const vk = new VK({ token: process.env.VK_KEY! });

// VK-чаты, где разрешены картинки вместо текстовых отговорок (аналог ME/TEST_GROUP/MEN_GROUP
// в Telegram). Список id чатов через запятую в VK_UNCEN; пусто = только текст.
function isUncen(peerId: number | string): boolean {
	const raw = (process.env.VK_UNCEN || '').trim();
	if (!raw) {
		return false;
	}
	return raw.split(',').map((s) => s.trim()).includes(String(peerId));
}

// ── загрузка исходных медиа ──────────────────────────────────────────────────

async function fetchBytes(url: string): Promise<Buffer> {
	const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
	if (!res.ok) {
		throw new Error(`GET ${url} -> ${res.status}`);
	}
	return Buffer.from(await res.arrayBuffer());
}

// Картинки, залитые в Telegram (file_id из variants.ts): скачиваем через getFile и
// перезаливаем в VK — так ответы VK совпадают с Telegram один в один.
async function fetchTelegramFile(fileId: string): Promise<Buffer> {
	const token = `${process.env.BOT_ID}:${process.env.BOT_SECRET}`;
	const meta = await fetch(
		`https://api.telegram.org/bot${token}/getFile?file_id=${encodeURIComponent(fileId)}`,
		{ signal: AbortSignal.timeout(10000) },
	);
	const metaJson: any = await meta.json();
	if (!metaJson.ok) {
		throw new Error(`getFile: ${metaJson.description}`);
	}
	return fetchBytes(`https://api.telegram.org/file/bot${token}/${metaJson.result.file_path}`);
}

// ── отправка в VK ────────────────────────────────────────────────────────────

function replyParams(replyTo?: number): Record<string, any> {
	return replyTo ? { reply_to: replyTo } : {};
}

// Загрузка на серверы VK (pu.vk.ru) периодически отвечает 504 Gateway Time-out.
// Ретраим загрузку+отправку, чтобы флап не съедал ответ.
async function withRetry<T>(label: string, fn: () => Promise<T>, attempts = 4): Promise<T> {
	let lastErr: unknown;
	for (let i = 1; i <= attempts; i++) {
		try {
			return await fn();
		} catch (error) {
			lastErr = error;
			console.error(`[vk] ${label}: попытка ${i}/${attempts} не удалась: ${(error as Error)?.message || error}`);
			if (i < attempts) {
				// Загрузка на pu.vk.ru периодически отдаёт 504 — даём серверу отойти.
				await new Promise((r) => setTimeout(r, 2000));
			}
		}
	}
	throw lastErr;
}

// Отправка с fallback: если VK не принимает reply_to (невалидный/устаревший
// conversation_message_id), повторяем без привязки к сообщению — ответ не теряется.
async function sendSafe(peerId: number, build: (replyTo?: number) => Record<string, any>, replyTo?: number) {
	try {
		return await vk.api.messages.send({ peer_id: peerId, random_id: Date.now(), ...build(replyTo) });
	} catch (error) {
		if (replyTo) {
			console.error(`[vk] отправка с reply_to=${replyTo} не удалась (${(error as Error)?.message}); повтор без reply_to`);
			return vk.api.messages.send({ peer_id: peerId, random_id: Date.now(), ...build(undefined) });
		}
		throw error;
	}
}

async function sendText(peerId: number, text: string, replyTo?: number) {
	const res = await sendSafe(peerId, (rt) => ({ message: text, ...replyParams(rt) }), replyTo);
	console.log(`[vk] текст -> ${peerId}, id=${res}`);
}

async function sendPhotoBuf(peerId: number, buffer: Buffer, replyTo?: number) {
	await withRetry('фото/загрузка', async () => {
		const photo = await vk.upload.messagePhoto({
			source: { value: buffer, filename: 'photo.jpg', contentType: 'image/jpeg' },
			peer_id: peerId,
		});
		const res = await sendSafe(peerId, (rt) => ({
			message: '',
			attachment: `photo${photo.ownerId}_${photo.id}`,
			...replyParams(rt),
		}), replyTo);
		console.log(`[vk] фото -> ${peerId}, id=${res}`);
	});
}

async function sendDocBuf(peerId: number, buffer: Buffer, filename: string, replyTo?: number) {
	await withRetry('документ/загрузка', async () => {
		const doc = await vk.upload.messageDocument({
			source: { value: buffer, filename },
			peer_id: peerId,
		});
		const res = await sendSafe(peerId, (rt) => ({
			message: '',
			attachment: `doc${doc.ownerId}_${doc.id}`,
			...replyParams(rt),
		}), replyTo);
		console.log(`[vk] документ -> ${peerId}, id=${res}`);
	});
}

// ── исполнение реакции ───────────────────────────────────────────────────────

function firstOf(x: any): any {
	return Array.isArray(x) ? x[0] : x;
}

async function execute(reaction: Reaction, peerId: number, replyTo?: number): Promise<void> {
	switch (reaction.t) {
		case 'text':
			return sendText(peerId, reaction.text, replyTo);
		case 'photoUrl':
			return sendPhotoBuf(peerId, await fetchBytes(reaction.url), replyTo);
		case 'tgPhoto':
			return sendPhotoBuf(peerId, await fetchTelegramFile(reaction.fileId), replyTo);
		case 'oboobs': {
			const item: any = firstOf(await oboobs());
			return sendPhotoBuf(peerId, await fetchBytes('https://media.oboobs.ru/' + item['preview']), replyTo);
		}
		case 'obutts': {
			const item: any = firstOf(await obutts());
			return sendPhotoBuf(peerId, await fetchBytes('https://media.obutts.ru/' + item['preview']), replyTo);
		}
		case 'giphy': {
			const result: any = await giphy(reaction.tag);
			const url = result?.data?.images?.downsized_medium?.url
				|| result?.data?.images?.original?.url;
			if (!url) {
				throw new Error('giphy: пустой ответ');
			}
			return sendDocBuf(peerId, await fetchBytes(url), 'giphy.gif', replyTo);
		}
		default:
			return;
	}
}

// ── обработка входящих ───────────────────────────────────────────────────────

export async function processVKMessage(message: any): Promise<void> {
	if (!message || message.out) {
		return; // исходящие (наши) не обрабатываем
	}
	const peerId = Number(message.peer_id);
	const fromId = message.from_id;
	const replyTo = message.conversation_message_id;
	const text = message.text || message.caption || '';

	const mention = new RegExp(`\\[club${process.env.VK_GROUP}\\|`, 'i').test(text)
		|| new RegExp(`@club${process.env.VK_GROUP}\\b`, 'i').test(text);

	const info: ReactionInfo = analyze(text, {
		mention,
		me: String(fromId) === process.env.ME,
		now: new Date(Number(message.date || 0) * 1000 || Date.now()),
	});

	console.log(`[vk] message_new peer=${peerId} from=${fromId}: ${text}`);
	console.log(`[vk] ${Object.entries(info).map(([k, v]) => `${k}=${v}`).join(' ')}`);

	const reaction = pickReaction(info, isUncen(peerId), variants);
	console.log(`[vk] реакция: ${reaction.t}`);

	try {
		await execute(reaction, peerId, replyTo);
	} catch (error) {
		console.error('[vk] ошибка реакции:', error);
	}
}

// ── вебхук ───────────────────────────────────────────────────────────────────

export const checkSecret = (body: any) => !!body?.secret && body?.secret === process.env.VK_SECRET;

export const checkConfirmation = (body: any) => body?.type === 'confirmation'
	&& String(body?.group_id) === process.env.VK_GROUP;

export async function handleVKWebhook(body: any): Promise<{ status: number; body: string }> {
	// Подтверждение адреса сервера обрабатываем ДО проверки secret: VK может прислать
	// confirmation без поля secret (см. пример в док. VK) — иначе получил бы 403.
	if (checkConfirmation(body)) {
		return { status: 200, body: String(process.env.VK_CONFIRM || '') };
	}

	if (!checkSecret(body)) {
		return { status: 403, body: '' };
	}

	const { type, object } = body || {};

	if (type === 'message_new') {
		// VK Callback API требует быстрый ack: отвечаем сразу, а реакцию
		// (загрузка медиа в VK может занимать секунды) выполняем фоном.
		void processVKMessage(object?.message ?? object).catch((error) => {
			console.error('[vk] processVKMessage:', error);
		});
	}

	if (type === 'group_join') {
		void vk.api.messages.send({
			peer_id: object?.user_id,
			message: 'Добро пожаловать в наше сообщество! 🎉',
			random_id: Date.now(),
		}).catch((error) => console.error('[vk] group_join:', error));
	}

	return { status: 200, body: 'ok' };
}
