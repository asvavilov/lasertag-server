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
		/*
		{
			file_id: 'AgACAgIAAxkBAAIBFmdUpjs_X2q0Y6u0JesOjD2Zq82HAAJg5zEbakygSi5TCRT4BvULAQADAgADcwADNgQ',
			file_unique_id: 'AQADYOcxG2pMoEp4',
			file_size: 1461,
			width: 90,
			height: 90
		},
		{
			file_id: 'AgACAgIAAxkBAAIBFmdUpjs_X2q0Y6u0JesOjD2Zq82HAAJg5zEbakygSi5TCRT4BvULAQADAgADbQADNgQ',
			file_unique_id: 'AQADYOcxG2pMoEpy',
			file_size: 21298,
			width: 320,
			height: 320
		},
		{
			file_id: 'AgACAgIAAxkBAAIBFmdUpjs_X2q0Y6u0JesOjD2Zq82HAAJg5zEbakygSi5TCRT4BvULAQADAgADeAADNgQ',
			file_unique_id: 'AQADYOcxG2pMoEp9',
			file_size: 62691,
			width: 640,
			height: 640
		},
		*/
		nimb: 'AgACAgIAAxkBAAIBFmdUpjs_X2q0Y6u0JesOjD2Zq82HAAJg5zEbakygSi5TCRT4BvULAQADAgADbQADNgQ',
		/*
		{
		  file_id: 'AgACAgIAAxkBAAIBGGdUqBVys0UCqw1NddKmGDSAZQsdAAJs5zEbakygSl7q3qYKwTHuAQADAgADcwADNgQ',
		  file_unique_id: 'AQADbOcxG2pMoEp4',
		  file_size: 1995,
		  width: 90,
		  height: 90
		},
		{
		  file_id: 'AgACAgIAAxkBAAIBGGdUqBVys0UCqw1NddKmGDSAZQsdAAJs5zEbakygSl7q3qYKwTHuAQADAgADbQADNgQ',
		  file_unique_id: 'AQADbOcxG2pMoEpy',
		  file_size: 26895,
		  width: 320,
		  height: 320
		},
		{
		  file_id: 'AgACAgIAAxkBAAIBGGdUqBVys0UCqw1NddKmGDSAZQsdAAJs5zEbakygSl7q3qYKwTHuAQADAgADeAADNgQ',
		  file_unique_id: 'AQADbOcxG2pMoEp9',
		  file_size: 83721,
		  width: 640,
		  height: 640
		},
		*/
		down: 'AgACAgIAAxkBAAIBGGdUqBVys0UCqw1NddKmGDSAZQsdAAJs5zEbakygSl7q3qYKwTHuAQADAgADbQADNgQ',
		/*
		{
		  file_id: 'AgACAgIAAxkBAAIBGWdUqQ_V1QE40o2cQdWVknzp379KAAJ05zEbakygSrneAlXFx6yMAQADAgADcwADNgQ',
		  file_unique_id: 'AQADdOcxG2pMoEp4',
		  file_size: 2380,
		  width: 90,
		  height: 90
		},
		{
		  file_id: 'AgACAgIAAxkBAAIBGWdUqQ_V1QE40o2cQdWVknzp379KAAJ05zEbakygSrneAlXFx6yMAQADAgADbQADNgQ',
		  file_unique_id: 'AQADdOcxG2pMoEpy',
		  file_size: 35007,
		  width: 320,
		  height: 320
		},
		{
		  file_id: 'AgACAgIAAxkBAAIBGWdUqQ_V1QE40o2cQdWVknzp379KAAJ05zEbakygSrneAlXFx6yMAQADAgADeAADNgQ',
		  file_unique_id: 'AQADdOcxG2pMoEp9',
		  file_size: 118879,
		  width: 640,
		  height: 640
		},
		*/
		b37: 'AgACAgIAAxkBAAIBGWdUqQ_V1QE40o2cQdWVknzp379KAAJ05zEbakygSrneAlXFx6yMAQADAgADbQADNgQ',
		/*
		{
		  file_id: 'AgACAgIAAxkBAAIBGmdUqStTNijS0idtHURv3Q9fSa7HAAJ15zEbakygSqVkTpkLwsgpAQADAgADcwADNgQ',
		  file_unique_id: 'AQADdecxG2pMoEp4',
		  file_size: 1034,
		  width: 40,
		  height: 90
		},
		{
		  file_id: 'AgACAgIAAxkBAAIBGmdUqStTNijS0idtHURv3Q9fSa7HAAJ15zEbakygSqVkTpkLwsgpAQADAgADbQADNgQ',
		  file_unique_id: 'AQADdecxG2pMoEpy',
		  file_size: 13549,
		  width: 144,
		  height: 320
		},
		{
		  file_id: 'AgACAgIAAxkBAAIBGmdUqStTNijS0idtHURv3Q9fSa7HAAJ15zEbakygSqVkTpkLwsgpAQADAgADeAADNgQ',
		  file_unique_id: 'AQADdecxG2pMoEp9',
		  file_size: 53781,
		  width: 360,
		  height: 800
		},
		{
		  file_id: 'AgACAgIAAxkBAAIBGmdUqStTNijS0idtHURv3Q9fSa7HAAJ15zEbakygSqVkTpkLwsgpAQADAgADeQADNgQ',
		  file_unique_id: 'AQADdecxG2pMoEp-',
		  file_size: 95894,
		  width: 576,
		  height: 1280
		},
		*/
		v: 'AgACAgIAAxkBAAIBGmdUqStTNijS0idtHURv3Q9fSa7HAAJ15zEbakygSqVkTpkLwsgpAQADAgADeAADNgQ',
	};

	return photos[Object.keys(photos)[Math.floor(Math.random() * Object.keys(photos).length)] as keyof typeof photos];
}
