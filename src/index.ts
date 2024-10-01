import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import * as util from 'util';
import { boobs, butts, oboobs, oleg, skipBoobs, skipFriday } from "./db";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

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
		&& !!message.text
		&& !message.message_thread_id // ответ
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

	return {
		boobs: (new RegExp('сиськ[ауи]|сисек|титьк[ауи]|титек|сис[яи]', 'i')).test(message.text),
		friday: (new RegExp('пятниц.?', 'i')).test(message.text),
		butts: (new RegExp('жоп[ауеы]', 'i')).test(message.text),
		oleg: (new RegExp('(?<![а-яё])олег.?(?![а-яё])', 'i')).test(message.text),
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
		if (info.nowFriday || [process.env.ME].includes(String(message.chat.id))) {
			if (info.me) {
				oboobs().then((result) => {
					const item = result[0];
					sendPhoto(message, 'https://media.oboobs.ru/' + item['preview']);
				});
			} else {
				sendMessage(message, boobs());
			}
		} else {
			sendMessage(message,
				(
					info.friday
					? skipFriday()
					: skipBoobs()
				)
			);
		}
	} else if (info.butts) {
		sendMessage(message, butts());
	} else if (info.oleg) {
		sendMessage(message, oleg());
	}
}

app.post("/ronin-bot", (req: Request, res: Response) => {
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
