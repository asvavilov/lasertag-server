import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import * as util from 'util';
//import cron from 'node-cron';
import { boobs, borisich, butts, giphy, oboobs, oleg, skipFriday } from "./variants";
import path from "path";
import * as fs from 'node:fs';
import readline from 'node:readline';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

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
	return [process.env.ME, process.env.TEST_GROUP, process.env.RONIN_GROUP].includes(String(message.chat.id))
	;
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
		butts: (new RegExp('жоп[ауеы]', 'i')).test(text),
		oleg: (new RegExp('(?<![а-яё])олег.?(?![а-яё])', 'i')).test(text),
		borisich: (new RegExp('борисыч', 'i')).test(text),
		com: (new RegExp('командир', 'i')).test(text),
		good: (new RegExp('м[ао]л[ао]]дец|м[ао]л[ао]дчина|кр[ао]савчик|кр[ао]савчег|кр[ао]саучег', 'i')).test(text),
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

	if (info.mention) {
		sendMessage(message, info.me ? 'Слушаюсь и повинуюсь, мой повелитель!' : 'Ты кто такой? Давай досвиданья!');
	} else if (info.boobs || info.friday) {
		if (info.nowFriday) {
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
		sendMessage(message, butts());
	} else if (info.oleg) {
		if (info.nowFriday) {
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
	//console.log(req);
	//console.log(req.headers);
	//console.log(req.body);
	console.log(util.inspect(req.body, { showHidden: true, depth: null }));

	processing(req.body.message);

	res.send();
});


app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});
