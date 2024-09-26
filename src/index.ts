import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import * as util from 'util';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

/*
app.get("/ronin-bot", (req: Request, res: Response) => {
	console.log(process.env)
	const url = `https://api.telegram.org/bot${process.env.BOT_ID}:${process.env.BOT_SECRET}/sendMessage`;
	const text = 'hello from express';
	console.log(url)
	fetch(url, {
		method: 'POST',
		headers: {
      'Content-Type': 'application/json'
    },
		body: JSON.stringify({
			chat_id: process.env.TEST_GROUP,
			text: text
		})
	});
	res.send();
});
*/

function sendMessage(message: any, text: string) {
	const url = `https://api.telegram.org/bot${process.env.BOT_ID}:${process.env.BOT_SECRET}/sendMessage`;
	fetch(url, {
		method: 'POST',
		headers: {
      'Content-Type': 'application/json'
    },
		body: JSON.stringify({
			chat_id: message.chat.id,
			reply_to_message_id: ['group', 'supergroup'].includes(message.chat.type) ? message.message_id : undefined,
			text: text
		})
	});
}

function validAge(message: any) {
	const now = (new Date()).getTime() / 1000;
	return now < message.date + 10;
}

function validSource(message: any) {
	return [process.env.ME].includes(String(message.from.id))
		|| [process.env.TEST_GROUP, process.env.RONIN_GROUP].includes(String(message.chat.id))
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

function skipFriday() {
	const vars = [
		'Сегодня не пятница.',
		'╭∩╮( •̀_•́ )╭∩╮',
		'¯\\_(ツ)_/¯',
		'╮ (. ❛ ᴗ ❛.) ╭',
		'👅',
	];
	return vars[Math.floor(Math.random() * vars.length)];
}

function skipBoobs() {
	const vars = [
		'Сегодня не пятница.',
		'Сегодня сисек не завезли. Заходите в пятницу.',
		'В пятницу получишь.',
		'╭∩╮( •̀_•́ )╭∩╮',
		'¯\\_(ツ)_/¯',
		'╮ (. ❛ ᴗ ❛.) ╭',
		'👅',
		'(＾◡＾)っ✂╰⋃╯',
	];
	return vars[Math.floor(Math.random() * vars.length)];
}

function boobs() {
	const vars = [
		'(.)(.)',
		'( • )( • )',
		'( . Y . )',
		'( • )( • )ԅ(≖‿≖ԅ)',
		'( • )( • )ԅ(‾⌣‾ԅ)',
		'( • )( • )ԅ(≖⌣≖ԅ)',
		'（(◎)＿(◎)）',
		'(. | .)',
		'//o-o\\',
		'( ๏ 人 ๏ )',
		'( .  人  . )',
		'( ͜ₒ ㅅ ͜ ₒ)',
		'( ͜. ㅅ ͜. )🥛 yumy',
		'( . 人 . )',
		'( ͜. ㅅ ͜. )',
		'👉( . )( . ) 👈',
		'(๏ 人 ๏)',
		'( ͜ₒ ㅅ ͜ ₒ)ლ(´ڡ`ლ)',
		'( • ) ( • )-----(≖_≖)',
		'I ♡ ( . )( . )',
		'(͜ₒ ㅅ ͜ ₒ)',
		'🍒',
		'(   +   )   (   +   )',
	];
	return vars[Math.floor(Math.random() * vars.length)];
}

function butts() {
	const vars = [
		'🫱( ‿ * ‿ )🫲',
		'(‿ˠ‿)',
		'(‿∣‿) slap 🤤',
		'(‿ˠ‿) ԅ(‾⌣‾ԅ)',
		'( ‿ 人 ‿ )',
		'(_!_) - жопа обыкновенная',
		'(__!__) - жирная жопа',
		'(_._) - жопа плоская',
		'(!) - тощая жопа',
		'{_!_} - шикарная жопа',
		'(_*_) - геморройная жопа',
		'(_zzz_) - жопа усталая',
		'(_?_) - жопа безмозглая',
		'(_о_) - жопа пользованная',
		'(_0_) - много раз пользованная',
		'(_$_) - новорусская жопа',
		'(_x_) - поцелуй меня в жопу!',
		'(_Х_) - оставь мою жопу в покое!',
		'(_^_) - заносчивая жопа.',
		'(ЖоЖ) - волосатая жопа',
		'("|") - волосатая жопа',
		'. - жопа, вид из космоса',
		'(_~_) - хитрая жопа',
		'(_:-)_) - очень хитрая жопа',
		'_e=mc2_) - умная жопа',
		'(_Ъ_) - твердая жопа',
		'(_Ь_) - мягкая жопа',
		'(_GO_) - иди в жопу',
		'->(_!_) пошел в жопу',
		'(_!_)-> как из жопы',
		'(_SOS_) - жопа в беде',
		'(_#_) - жопа зека',
		'{-------O-------} очень большая жопа',
		//'"КРЫЛАТЫЕ" ЖОПЫ',
		'(_100%_) - полная жопа (крылатая фраза)',
		'(_!_)] - жопа с ручкой',
		'(_!_)S - жопа с ручкой',
		'->(_!_)-> через жопу (делать что-либо)',
		'(_=_) какая, в жопу, разница?',
		//'КОРОТКИЕ СООБЩЕНИЯ',
		'(_Я_) - Я в жопе...',
		'(__Я__) - Я в полной жопе...',
		'(_Мы_) - Мы в жопе:',
		'(_->._) - Иди в жопу!',
		//'к(_!_)Э - жопа с ушами',
		'c( o ) - жопа с ручкой',
		'(_!_)(___!___)(_!_)(__!__) - Ронины на построении...',
	];
	return vars[Math.floor(Math.random() * vars.length)];
}

function oleg() {
	const vars = [
		'💪🏻',
		'🏋',
		'💪',
		'🏋️‍♂️',
		'🏋🏽‍♂️',
		'🏋️',
		'🏋🏼',
		'🏋🏿',
		'🏋️‍♀️',
		'🏋🏻‍♂️',
		'💪🏼',
		'🏋🏼‍♂️',
		'💪🏿',
		'🏋🏻‍♀️',
		'🏋🏽',
		'🏋🏾‍♂️',
		'🏋🏻',
		'🏋🏿‍♂️',
	];
	return vars[Math.floor(Math.random() * vars.length)];
}

function getInfo(message: any) {
	const now = new Date();

	// TODO реагировать на упоминание
	/*
	0|bot  | 2024-09-25T19:11:30:     text: '@Ronin37Bot ок',
	0|bot  | 2024-09-25T19:11:30:     entities: [ { offset: 0, length: 11, type: 'mention' }, [length]: 1 ]
	*/

	return {
		boobs: (new RegExp('сиськ[ауи]|сисек|титьк[ауи]|титек|сис[яи]', 'i')).test(message.text),
		friday: (new RegExp('пятниц.?', 'i')).test(message.text),
		butts: (new RegExp('жоп[ауеы]', 'i')).test(message.text),
		oleg: (new RegExp('(?<![а-яё])олег.?(?![а-яё])', 'i')).test(message.text),
		nowFriday: now.getDay() === 5,
	};
}

function processing(message: any) {
	if (!canParse(message)) {
		return;
	}

	const info = getInfo(message);

	console.log(`processing...\n${message.text}`);

	if (info.boobs || info.friday) {
		sendMessage(message,
			(
				info.nowFriday
				? boobs()
				: (
						info.friday
						? skipFriday()
						: skipBoobs()
					)
			)
		);
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
