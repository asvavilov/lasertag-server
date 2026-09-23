import * as fs from 'node:fs';
import path from 'node:path';

// Хранилище истории сообщений: по одному JSON на строку (.jsonl), файл на каждый день,
// отдельная ПАПКА на каждый чат — чтобы потоки не смешивались.
// Каталог смонтирован volume'ом, поэтому данные переживают пересборку контейнера.
//
//   logs/dm/messages-2026-09-23.jsonl          личка владельца
//   logs/ronins/messages-2026-09-23.jsonl      группа Ronin's
//   logs/mytestgroup/messages-2026-09-23.jsonl тестовая группа
//   logs/ronin-sisa/messages-2026-09-23.jsonl  18+ группа
const LOG_DIR = process.env.HISTORY_DIR || path.join(__dirname, '../logs');
const KEEP_DAYS = Number(process.env.HISTORY_KEEP_DAYS || 30);

// Права: файлы пишет контейнер (root), а поиск/отправку делает хост (openclaw).
// Без этого хост не смог бы дописывать свои записи в файл, созданный root'ом.
const DIR_MODE = 0o777;
const FILE_MODE = 0o666;

const TRANSLIT: Record<string, string> = {
	а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
	й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
	у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '',
	э: 'e', ю: 'yu', я: 'ya',
};

function dayKey(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

// Имя папки чата: dm для лички, иначе транслит названия группы.
export function chatDirName(chat: any): string {
	if (!chat) {
		return 'unknown';
	}
	if (chat.type === 'private') {
		return 'dm';
	}
	const title = chat.title;
	if (!title) {
		return `chat-${chat.id}`;
	}
	const slug = String(title)
		.toLowerCase()
		// апострофы и прочие кавычки выкидываем до транслита,
		// иначе "Ronin's" превращается в "ronin-s"
		.replace(/['\u2019\u2018`]/g, '')
		.split('')
		.map((c) => TRANSLIT[c] ?? c)
		.join('')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return slug || `chat-${chat.id}`;
}

function ensureDir(dir: string) {
	fs.mkdirSync(dir, { recursive: true });
	try {
		fs.chmodSync(dir, DIR_MODE);
	} catch {
		// права уже могли быть выставлены — не критично
	}
}

function appendLine(dirName: string, record: any) {
	const dir = path.join(LOG_DIR, dirName);
	ensureDir(dir);
	const file = path.join(dir, `messages-${dayKey(new Date())}.jsonl`);
	fs.appendFileSync(file, JSON.stringify(record) + '\n');
	try {
		fs.chmodSync(file, FILE_MODE);
	} catch {
		// не критично: контейнер пишет от root и так
	}
}

// Записать входящий апдейт Telegram (message / edited_message).
export function saveHistory(body: any) {
	try {
		const edited = !!body?.edited_message;
		const msg = body?.message || body?.edited_message;
		if (!msg || !msg.chat) {
			return;
		}

		const from = msg.from || {};
		const name = [from.first_name, from.last_name].filter(Boolean).join(' ') || null;

		const record = {
			ts: new Date().toISOString(),
			direction: 'in',
			update_id: body.update_id ?? null,
			edited,
			message_id: msg.message_id ?? null,
			date: msg.date ?? null,
			chat_id: msg.chat.id ?? null,
			chat_title: msg.chat.title ?? null,
			chat_type: msg.chat.type ?? null,
			from_id: from.id ?? null,
			from_username: from.username ?? null,
			from_name: name,
			text: msg.text ?? msg.caption ?? null,
			location: msg.location ?? null,
		};

		appendLine(chatDirName(msg.chat), record);
	} catch (err) {
		console.error('[history] не удалось записать сообщение:', err);
	}
}

// Записать исходящее сообщение бота (ответы на сообщения).
export function saveSent(chat: any, kind: 'text' | 'photo' | 'video', payload: string) {
	try {
		if (!chat) {
			return;
		}
		appendLine(chatDirName(chat), {
			ts: new Date().toISOString(),
			direction: 'out',
			kind,
			chat_id: chat.id ?? null,
			chat_title: chat.title ?? null,
			chat_type: chat.type ?? null,
			from_id: null,
			from_username: null,
			from_name: 'RoninBot',
			text: payload,
		});
	} catch (err) {
		console.error('[history] не удалось записать исходящее:', err);
	}
}

// Удалить дневные файлы старше KEEP_DAYS (в корне и во всех папках чатов).
// Возвращает число удалённых файлов.
export function cleanupHistory(): number {
	let removed = 0;
	try {
		ensureDir(LOG_DIR);

		const cutoff = new Date();
		cutoff.setHours(0, 0, 0, 0);
		cutoff.setDate(cutoff.getDate() - KEEP_DAYS);

		const dirs: string[] = [LOG_DIR];
		for (const entry of fs.readdirSync(LOG_DIR, { withFileTypes: true })) {
			if (entry.isDirectory()) {
				dirs.push(path.join(LOG_DIR, entry.name));
			}
		}

		for (const dir of dirs) {
			for (const name of fs.readdirSync(dir)) {
				const m = name.match(/^messages-(\d{4})-(\d{2})-(\d{2})\.jsonl$/);
				if (!m) {
					continue;
				}
				const fileDay = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
				if (fileDay < cutoff) {
					fs.unlinkSync(path.join(dir, name));
					removed++;
				}
			}
		}

		// пустые папки чатов убираем за собой
		for (const entry of fs.readdirSync(LOG_DIR, { withFileTypes: true })) {
			if (!entry.isDirectory()) {
				continue;
			}
			const dir = path.join(LOG_DIR, entry.name);
			if (fs.readdirSync(dir).length === 0 && dir !== LOG_DIR) {
				fs.rmdirSync(dir);
			}
		}
	} catch (err) {
		console.error('[history] не удалось почистить старые логи:', err);
	}
	return removed;
}
