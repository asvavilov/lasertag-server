/*
video borisichda:
BAACAgIAAyEFAASRmkyUAAMOaP5iRgtC1UcrtbWwbnLGpsEQbicAAs5bAAKjypFKkV7Tpo7HWQg2BA
video nenashi:
BAACAgIAAyEFAASRmkyUAAM-aPtT9xAUDxJ8Cjcne6c1Svflkc0AAhKDAAKdEGFLk2vjV5q-cgo2BA
video osechka:
BAACAgIAAyEFAASRmkyUAAMVaP5gFdGAeUtFx-NDwabH3MFxDDwAAlZOAAJFDelJLSIuMCMRDq82BA
video rody:
BAACAgIAAyEFAASRmkyUAAM9aPtT3tXc-43290gFVT9-N9Rk2q8AAoaDAAJNDplLpBihpJj1NEM2BA
video aplodismenty:
CgACAgIAAyEFAASRmkyUAAMbaP5gu7sQe9kO54dk09yZUWbCbSAAAjSHAAJ_IVFIdxsk0xqGfck2BA
video krestny:
BAACAgIAAx0CaIljbAABAbr2aQLzmseD-JdFF8UCqL_T3tby_8MAArKAAAK8KhlIO7JHFDTKrBk2BA
*/

export function skipFriday() {
	const vars = [
		'Сегодня не пятница.',
		'╭∩╮( •̀_•́ )╭∩╮',
		'¯\\_(ツ)_/¯',
		'╮ (. ❛ ᴗ ❛.) ╭',
		'👅',
	];
	return vars[Math.floor(Math.random() * vars.length)];
}

export function boobs() {
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
		'(＾◡＾)っ✂╰⋃╯',
	];
	return vars[Math.floor(Math.random() * vars.length)];
}

export function oboobs() {
/*
TODO сиськи (и попки для мужского чата)
http://api.oboobs.ru/
https://media.oboobs.ru
https://media.oboobs.ru/boobs_preview/19733.jpg
https://media.oboobs.ru/boobs/19733.jpg
https://media.oboobs.ru/noise_preview/22423.png
https://media.oboobs.ru/noise/22423.png
сигнал: http://api.oboobs.ru/boobs/0/1/random/
шум: http://api.oboobs.ru/noise/1/
*/
	return fetch(
		Math.round(Math.random() * 2) == 0
			? 'http://api.oboobs.ru/noise/1/'
			: 'http://api.oboobs.ru/boobs/0/1/random/'
		,
		{
			method: 'GET',
			signal: AbortSignal.timeout(5000)
		}
	).then(response => response.json()).then(result => {
		if (!Array.isArray(result) && result.length > 0) {
			throw Error("unexpected response:\n" + JSON.stringify(result));
		}
		return result;
	});
}

export function obutts() {
	return fetch(
		'http://api.obutts.ru/butts/0/1/random/',
		{
			method: 'GET',
			signal: AbortSignal.timeout(5000)
		}
	).then(response => response.json()).then(result => {
		if (!Array.isArray(result) && result.length > 0) {
			throw Error("unexpected response:\n" + JSON.stringify(result));
		}
		return result;
	});
}

export function butts() {
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

export function oleg() {
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

export function nooleg() {
	const photos = {
		boobs: 'AgACAgIAAyEFAASRmkyUAAMPaPqDsx2uklw6J2GUinmSdaIiu6gAAhXyMRvI4ZBJIeTbNI15ZBABAAMCAANtAAM2BA',
		babka: 'AgACAgIAAyEFAASRmkyUAAMTaPqELj697ZNsWv6jQKLk-hrHVG4AAmniMRs9I5hKpzA8Sl4AAXQdAQADAgADbQADNgQ',
		mustache: 'AgACAgIAAyEFAASRmkyUAAMWaPqETCRu10ReuSRPHngBGK5O6OcAAjPeMRsM2blJ58y78401R58BAAMCAANtAAM2BA',
		pistolet: 'AgACAgIAAyEFAASRmkyUAAM6aPtTeL_bYZnqU3m4kd2ON4VQpHoAApj5MRvYduBL-VJ_hO_5WuEBAAMCAAN4AAM2BA',
		nebudu: 'AgACAgIAAyEFAASRmkyUAAM7aPtTeNoAAb4UJh6Frhsm4c1dK3gJAAKa-TEb2HbgSyJpo9X0iItxAQADAgADeAADNgQ',
		tobipizda: 'AgACAgIAAyEFAASRmkyUAAM8aPtTeMDFIy9aUfRPidq0HMM8mVcAApv5MRvYduBL7g2kfc159FABAAMCAAN4AAM2BA',
		krestny: 'AgACAgIAAyEFAASRmkyUAAM_aPtUroyAgV97INMePrYri4U_FxMAApr2MRt6sllLF_kQZDxDeTABAAMCAAN4AAM2BA',
		babkamulti: 'AgACAgIAAyEFAASRmkyUAANAaPv0FViS9mExfaYszFWBSrlpUYMAAnj4MRtrIuFL-oEqfJpo5scBAAMCAAN4AAM2BA',
	};

	return photos[Object.keys(photos)[Math.floor(Math.random() * Object.keys(photos).length)] as keyof typeof photos];
}

export function giphy(search: string) {
	return fetch(
		`https://api.giphy.com/v1/gifs/random?api_key=${process.env.GIPHY_API_KEY}&tag=${search}`,
		{
			method: 'GET',
			signal: AbortSignal.timeout(5000)
		}
	).then(response => response.json()).then(result => {
		if (!Array.isArray(result) && result.length > 0) {
			throw Error("unexpected response:\n" + JSON.stringify(result));
		}
		return result;
	});
}

export function borisich() {
	const photos = {
		nimb: 'AgACAgIAAxkBAAIBFmdUpjs_X2q0Y6u0JesOjD2Zq82HAAJg5zEbakygSi5TCRT4BvULAQADAgADbQADNgQ',
		down: 'AgACAgIAAxkBAAIBGGdUqBVys0UCqw1NddKmGDSAZQsdAAJs5zEbakygSl7q3qYKwTHuAQADAgADbQADNgQ',
		b37: 'AgACAgIAAxkBAAIBGWdUqQ_V1QE40o2cQdWVknzp379KAAJ05zEbakygSrneAlXFx6yMAQADAgADbQADNgQ',
		v: 'AgACAgIAAxkBAAIBGmdUqStTNijS0idtHURv3Q9fSa7HAAJ15zEbakygSqVkTpkLwsgpAQADAgADeAADNgQ',
	};

	return photos[Object.keys(photos)[Math.floor(Math.random() * Object.keys(photos).length)] as keyof typeof photos];
}
