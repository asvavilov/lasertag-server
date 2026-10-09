import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import * as util from 'util';
//import cron from 'node-cron';
import { boobs, borisich, butts, giphy, oboobs, obutts, oleg, nooleg, skipFriday } from "./variants";
import { Reaction, ReactionVariants, ReactionInfo, analyze, pickReaction } from "./reactions";
import { handleVKWebhook } from "./vk";
import path from "path";
import * as fs from 'node:fs';
import readline from 'node:readline';
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

// Разбор Telegram-сообщения в общий формат триггеров. Сами реакции выбирает
// общий модуль ./reactions — тот же, что используется в VK.
function getInfo(message: any): ReactionInfo {
	const mention = Array.isArray(message.entities)
		? !!message.entities.find((ent: any) => ent.type === 'mention' && message.text.substring(ent.offset, ent.offset + ent.length) === process.env.BOT)
		: false
		;

	const text = message.text || message.caption;

	return analyze(text, {
		mention,
		me: String(message.from.id) === process.env.ME,
	});
}

// Исполнение реакции в Telegram. Картинки/видео Telegram принимает как URL или file_id.
function executeTelegram(reaction: Reaction, message: any) {
	switch (reaction.t) {
		case 'text':
			return sendMessage(message, reaction.text);
		case 'photoUrl':
			return sendPhoto(message, reaction.url);
		case 'tgPhoto':
			return sendPhoto(message, reaction.fileId);
		case 'oboobs':
			return oboobs().then((result) => {
				const item = result[0];
				sendPhoto(message, 'https://media.oboobs.ru/' + item['preview']);
			});
		case 'obutts':
			return obutts().then((result) => {
				const item = result[0];
				sendPhoto(message, 'https://media.obutts.ru/' + item['preview']);
			});
		case 'giphy':
			return giphy(reaction.tag).then((result) => {
				sendVideo(message, result['data']['images']['downsized_medium']['url']);
			});
		default:
			return;
	}
}

const telegramVariants: ReactionVariants = { skipFriday, boobs, butts, oleg, nooleg, borisich };

function processing(message: any) {
	if (!canParse(message)) {
		return;
	}

	const info = getInfo(message);

	//console.log(`processing...\n${message.text}`);
	console.log(util.inspect(info, { showHidden: true, depth: null }));

	const reaction = pickReaction(info, isUncen(message), telegramVariants);
	executeTelegram(reaction, message);
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

app.post("/ronin/vkbot", async (req: Request, res: Response) => {
	console.log(util.inspect(req.body, { showHidden: true, depth: null }));

	const { status, body } = await handleVKWebhook(req.body);
	res.status(status).send(body);
});

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
