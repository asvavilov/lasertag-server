import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import * as util from 'util';
//import cron from 'node-cron';
import { boobs, borisich, butts, giphy, oboobs, obutts, oleg, nooleg, skipFriday } from "./variants";
import path from "path";
import * as fs from 'node:fs';
import readline from 'node:readline';
import { VK } from 'vk-io';
import https from 'node:https';
import { saveHistory, saveSent, cleanupHistory } from './history';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8443;

app.use(express.json());

/*
cron.schedule('* * * * *', () => {
	console.log('running a task every minute');
});
*/


// TODO разнести по папкам и файлам


// гео

async function readLog() {
	const db: any[] = [];

	const fileStream = fs.createReadStream(path.join(__dirname + '/../bot-geo.log'));

	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity,
	});
	// Note: we use the crlfDelay option to recognize all instances of CR LF
	// ('\r\n') in input.txt as a single line break.

	let buf = '';
	for await (const rawLine of rl) {
		const line = rawLine.replace(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}: /, '');
		buf += line;
		if (line === '}') {
			//console.log(buf);
			const item = {
				date: Number(buf.match(/edit_date: (\d+)/)?.[1] || buf.match(/date: (\d+)/)?.[1]),
				latitude: Number(buf.match(/latitude: ([\d.]+)/)?.[1]),
				longitude: Number(buf.match(/longitude: ([\d.]+)/)?.[1]),
				heading: Number(buf.match(/heading: (\d+)/)?.[1]),
				horizontal_accuracy: Number(buf.match(/horizontal_accuracy: (\d+)/)?.[1]),
			};
			db.push(item);
			// TODO если логировать в json, то получается такой же не стандартный, но в одну строку
			//db.push(JSON.parse(buf));
			buf = '';
		}
	}

	return db;
}

app.post("/ronin/geo", async (req: Request, res: Response) => {
	// TODO чтение лога (или для оптимзации можно один раз читать при запуске)
	res.send(await readLog());
});


/// приложение бота

app.use('/ronin/bot-app/', express.static(path.join(__dirname, '../../client/dist/spa')));


/// бот

function sendMessage(message: any, text: string) {
	saveSent(message.chat, 'text', text);
	const url = `https://api.telegram.org/bot${process.env.BOT_ID}:${process.env.BOT_SECRET}/sendMessage`;
	fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			chat_id: message.chat.id,
			reply_parameters: ['group', 'supergroup'].includes(message.chat.type) ? {
				message_id: message.message_id,
			} : undefined,
			text: text
		})
	});
}

function sendPhoto(message: any, photo: string) {
	saveSent(message.chat, 'photo', photo);
	const url = `https://api.telegram.org/bot${process.env.BOT_ID}:${process.env.BOT_SECRET}/sendPhoto`;
	fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			chat_id: message.chat.id,
			reply_parameters: ['group', 'supergroup'].includes(message.chat.type) ? {
				message_id: message.message_id,
			} : undefined,
			photo: photo,
		})
	});
}

function sendVideo(message: any, video: string) {
	saveSent(message.chat, 'video', video);
	const url = `https://api.telegram.org/bot${process.env.BOT_ID}:${process.env.BOT_SECRET}/sendVideo`;
	fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			chat_id: message.chat.id,
			reply_parameters: ['group', 'supergroup'].includes(message.chat.type) ? {
				message_id: message.message_id,
			} : undefined,
			video: video,
		})
	});
}

function validAge(message: any) {
	const now = (new Date()).getTime() / 1000;
	return now < message.date + 10;
}

function validSource(message: any) {
	//[process.env.ME].includes(String(message.from.id))
	return [process.env.ME, process.env.TEST_GROUP, process.env.RONIN_GROUP, process.env.MEN_GROUP].includes(String(message.chat.id));
}

function isUncen(message: any) {
	return [process.env.ME, process.env.TEST_GROUP, process.env.MEN_GROUP].includes(String(message.chat.id));
}

function canParse(message: any) {
	return !!message
		&& !message.from.is_bot // бот
		&& (!!message.text || !!message.caption)
		//&& !message.message_thread_id // ответ
		&& !message.link_preview_options // ссылка
		&& validSource(message) // правильная группа или пользователь
		&& validAge(message) // не слишком ли старое
		;
}

function getInfo(message: any) {
	const now = new Date();

	const mention = Array.isArray(message.entities)
		? !!message.entities.find((ent: any) => ent.type === 'mention' && message.text.substring(ent.offset, ent.offset + ent.length) === process.env.BOT)
		: false
		;

	const text = message.text || message.caption;

	return {
		boobs: (new RegExp('сиськ[ауи]|сисек|титьк[ауи]|титек|сис[яи]', 'i')).test(text),
		friday: (new RegExp('пятни[цч].?', 'i')).test(text),
		butts: (new RegExp('(?<![а-яё])[пж]оп[ауеы].?(?![а-яё])', 'i')).test(text),
		oleg: (new RegExp('(?<![а-яё])олег.?(?![а-яё])', 'i')).test(text),
		borisich: (new RegExp('борисыч', 'i')).test(text),
		com: (new RegExp('командир', 'i')).test(text),
		good: (new RegExp('м[ао]л[ао]дец|м[ао]л[ао]дчина|кр[ао]савчик|кр[ао]савчег|кр[ао]саучег', 'i')).test(text),
		nowFriday: now.getDay() === 5,
		mention: mention,
		me: String(message.from.id) === process.env.ME,
	};
}

function processing(message: any) {
	if (!canParse(message)) {
		return;
	}

	const info = getInfo(message);

	//console.log(`processing...\n${message.text}`);
	console.log(util.inspect(info, { showHidden: true, depth: null }));

	const uncen = isUncen(message);

	if (info.mention) {
		sendMessage(message, info.me ? 'Слушаюсь и повинуюсь, мой повелитель!' : 'Ты кто такой? Давай досвиданья!');
	} else if (info.boobs || info.friday) {
		if (info.nowFriday || uncen) {
			oboobs().then((result) => {
				const item = result[0];
				sendPhoto(message, 'https://media.oboobs.ru/' + item['preview']);
			});
		} else {
			sendMessage(message,
				(
					info.friday
						? skipFriday()
						: boobs()
				)
			);
		}
	} else if (info.butts) {
		if (uncen) {
			obutts().then((result) => {
				const item = result[0];
				sendPhoto(message, 'https://media.obutts.ru/' + item['preview']);
			});
		} else {
			sendMessage(message, butts());
		}
	} else if (info.oleg) {
		if (uncen) {
			sendPhoto(message, nooleg());
		} else if (info.nowFriday) {
			giphy('bodybuilder').then((result) => {
				sendVideo(message, result['data']['images']['downsized_medium']['url']);
			});
		} else {
			sendMessage(message, oleg());
		}
	} else if ((info.borisich || info.com) && info.good) {
		sendPhoto(message, borisich());
	}
}

app.post("/ronin/bot", (req: Request, res: Response) => {

	if (secret_token !== req.get('X-Telegram-Bot-Api-Secret-Token')) {
		res.send();
		return;
	}

	//console.log(req);
	//console.log(req.headers);
	//console.log(req.body);
	console.log(util.inspect(req.body, { showHidden: true, depth: null }));

	saveHistory(req.body);

	processing(req.body.message);

	res.send();
});

/// VK

const VK_API_VER = '5.199';
const VK_TOKEN = process.env.VK_KEY;
const API_VERSION = VK_API_VER;

//const vkbot = new VkBot(process.env.VK_KEY!);
// FIXME переписать все на API?
const vk = new VK({
	token: VK_TOKEN!
});

app.post("/ronin/vkbot", async (req: Request, res: Response) => {
	console.log(util.inspect(req.body, { showHidden: true, depth: null }));

	if (!checkSecret(req.body)) {
		res.status(403).send();
		return;
	}

	if (checkConfirmation(req.body)) {
		res.send(process.env.VK_CONFIRM);
		return;
	}

	const { type, object, group_id, secret } = req.body;

	if (type === 'message_new') {
		const message = object.message;
		const peerId = message.peer_id;
		const text = message.text?.toLowerCase() || '';
		const replyTo = message.conversation_message_id;

		console.log(`Новое сообщение от ${peerId}: ${text}`);

		// Ищем слово "пятница"
		if (text.includes('пятница')) {
			console.log('Найдено слово "пятница"! Отправляем картинку...');

			try {
				// Читаем картинку
				const imagePath = path.join(__dirname, '..', 'test.jpg');
				const imageBuffer = fs.readFileSync(imagePath);

				// Загружаем картинку
				//const photo = await vkUploadPhoto(imageBuffer);
				const photo = await uploadPhotoVKIO(imageBuffer, peerId);
				const attachment = `photo${photo.owner_id}_${photo.id}`;

				// Отправляем сообщение с картинкой
				//await vkSendMessage(peerId, 'Ура! Пятница! 🎉', attachment);
				await vk.api.messages.send({
					peer_id: peerId,
					reply_to: replyTo,
					message: 'Ура! Пятница! 🎉',
					attachment: attachment,
					random_id: Date.now(), // Уникальный ID для избежания дублей
				});
			} catch (error) {
				console.error('Ошибка при отправке картинки:', error);
				// Отправляем текстовое сообщение в случае ошибки
				await vkSendMessage(peerId, 'Пятница! Но картинку загрузить не удалось 😢');
			}
		}
	}

	// Дополнительные обработчики типов событий
	if (type === 'message_reply') {
		console.log('Ответ на сообщение');
		// Логика для ответов
	}

	if (type === 'message_edit') {
		console.log('Сообщение отредактировано');
		// Логика для отредактированных сообщений
	}

	if (type === 'group_join') {
		console.log('Новый участник вступил в группу');
		// Приветственное сообщение
		const userId = object.user_id;
		await vkSendMessage(userId, 'Добро пожаловать в наше сообщество! 🎉');
	}

	res.send('ok');
});

const checkSecret = (body: Record<string, string | number> | null | undefined) => body?.secret && body?.secret === process.env.VK_SECRET;

const checkConfirmation = (body: Record<string, string | number> | null | undefined) => body?.type && body?.type === 'confirmation' && String(body?.group_id) === process.env.VK_GROUP;

/**
 * Отправка сообщения через VK API
 */
async function vkSendMessage(peerId: number, message: string, attachment?: string) {
	try {
		const params = new URLSearchParams({
			peer_id: peerId.toString(),
			message: message,
			random_id: Date.now().toString(), // Уникальный ID для избежания дублей
			access_token: process.env.VK_KEY!,
			v: VK_API_VER
		});

		if (attachment) {
			params.append('attachment', attachment);
		}

		const response = await fetch(`https://api.vk.com/method/messages.send?${params}`);
		const data = await response.json();

		if (data.error) {
			console.error('Ошибка VK API:', data.error);
		} else {
			console.log(`Сообщение отправлено в чат ${peerId}, ID: ${data.response}`);
		}
	} catch (error) {
		console.error('Ошибка при отправке сообщения:', error);
	}
}

async function vkUploadPhoto(imageBuffer: Buffer): Promise<{ owner_id: number; id: number }> {
	try {
		// 1. Получаем URL для загрузки
		const getUploadUrlResponse = await fetch(
			`https://api.vk.com/method/photos.getMessagesUploadServer?access_token=${VK_TOKEN}&v=${API_VERSION}`
		);
		const uploadData = await getUploadUrlResponse.json();

		if (uploadData.error) {
			throw new Error(`Ошибка получения URL: ${uploadData.error.error_msg}`);
		}

		const uploadUrl = uploadData.response.upload_url;

		// 2. Загружаем фото
		const formData = new FormData();
		const blob = new Blob([new Uint8Array(imageBuffer)], { type: 'image/jpeg' });
		formData.append('photo', blob, 'test.jpg');

		const uploadResponse = await fetch(uploadUrl, {
			method: 'POST',
			body: formData
		});
		const uploadResult = await uploadResponse.json();
		//console.log(util.inspect(uploadResult, { showHidden: true, depth: null }));

		// 3. Сохраняем фото через VK API
		const saveParams = new URLSearchParams({
			photo: uploadResult.photo,
			server: uploadResult.server.toString(),
			hash: uploadResult.hash,
			access_token: VK_TOKEN!,
			v: API_VERSION
		});

		const saveResponse = await fetch(`https://api.vk.com/method/photos.saveMessagesPhoto?${saveParams}`);
		const saveResult = await saveResponse.json();
		//console.log(util.inspect(saveResult, { showHidden: true, depth: null }));
		const savedPhoto = Array.isArray(saveResult.response)
			? saveResult.response[0]
			: saveResult.response;

		return {
			owner_id: savedPhoto.owner_id,
			id: savedPhoto.id
		};
	} catch (error) {
		console.error('Ошибка загрузки фото:', error);
		throw error;
	}
}

// TODO см. варианты загрузки картинки
// https://github.com/negezor/vk-io/blob/master/docs/ru/guide/upload.md
// TODO читать уже загруженные картинки (заранее куда-то загрузить или как в тг - один раз и потом сохранить)
async function uploadPhotoVKIO(imageBuffer: Buffer, peerId: number) {
	const photo = await vk.upload.messagePhoto({
		source: { value: imageBuffer },
		peer_id: peerId, // ID чата, куда отправляем
	});

	return {
		owner_id: photo.ownerId,
		id: photo.id
	};
}

/// server
const secret_token = fs.readFileSync(path.join(__dirname, '../../.ssl/secret_token')).toString().trim();
const options = {
	key: fs.readFileSync(path.join(__dirname, '../../.ssl/key.pem')),
	cert: fs.readFileSync(path.join(__dirname, '../../.ssl/cert.pem'))
};
const server = https.createServer(options, app);

server.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);

	// история сообщений: чистка при старте и раз в сутки
	const removed = cleanupHistory();
	console.log(`[history]: retention ${process.env.HISTORY_KEEP_DAYS || 30} дней, удалено старых файлов: ${removed}`);
	setInterval(() => {
		const n = cleanupHistory();
		if (n) {
			console.log(`[history]: удалено старых файлов: ${n}`);
		}
	}, 24 * 60 * 60 * 1000);
});

// Обработка ошибок
process.on('uncaughtException', (error) => {
	console.error('Необработанное исключение:', error);
});
