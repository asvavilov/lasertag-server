// Общая (платформо-независимая) логика реакций бота — используется и в Telegram, и в VK.
// Реакции Telegram и VK должны совпадать: одни триггеры, одни и те же тексты/картинки.

export interface ReactionInfo {
	boobs: boolean;
	friday: boolean;
	butts: boolean;
	oleg: boolean;
	borisich: boolean;
	com: boolean;
	good: boolean;
	nowFriday: boolean;
	mention: boolean;
	me: boolean;
}

// Разбор текста на набор триггеров (те же регулярки, что были в Telegram).
export function analyze(text: string, opts: { mention?: boolean; me?: boolean; now?: Date } = {}): ReactionInfo {
	const now = opts.now ?? new Date();
	const t = text || '';
	return {
		boobs: (new RegExp('сиськ[ауи]|сисек|титьк[ауи]|титек|сис[яи]', 'i')).test(t),
		friday: (new RegExp('пятни[цч].?', 'i')).test(t),
		butts: (new RegExp('(?<![а-яё])[пж]оп[ауеы].?(?![а-яё])', 'i')).test(t),
		oleg: (new RegExp('(?<![а-яё])олег.?(?![а-яё])', 'i')).test(t),
		borisich: (new RegExp('борисыч', 'i')).test(t),
		com: (new RegExp('командир', 'i')).test(t),
		good: (new RegExp('м[ао]л[ао]дец|м[ао]л[ао]дчина|кр[ао]савчик|кр[ао]савчег|кр[ао]саучег', 'i')).test(t),
		nowFriday: now.getDay() === 5,
		mention: !!opts.mention,
		me: !!opts.me,
	};
}

// Абстрактное действие реакции. Каждая платформа исполняет его по-своему.
export type Reaction =
	| { t: 'text'; text: string }
	| { t: 'oboobs' }               // случайная картинка oboobs (URL)
	| { t: 'obutts' }               // случайная картинка obutts (URL)
	| { t: 'photoUrl'; url: string }
	| { t: 'tgPhoto'; fileId: string }  // картинка, залитая в Telegram (file_id из variants.ts)
	| { t: 'giphy'; tag: string }   // гифка из Giphy (отправляется как видео/документ)
	| { t: 'none' };

export interface ReactionVariants {
	skipFriday: () => string;
	boobs: () => string;
	butts: () => string;
	oleg: () => string;
	nooleg: () => string;
	borisich: () => string;
}

// Выбор реакции по разобранному тексту. Логика 1:1 повторяет прежний Telegram-обработчик.
export function pickReaction(info: ReactionInfo, uncen: boolean, v: ReactionVariants): Reaction {
	if (info.mention) {
		return { t: 'text', text: info.me ? 'Слушаюсь и повинуюсь, мой повелитель!' : 'Ты кто такой? Давай досвиданья!' };
	}
	if (info.boobs || info.friday) {
		if (info.nowFriday || uncen) {
			return { t: 'oboobs' };
		}
		return { t: 'text', text: info.friday ? v.skipFriday() : v.boobs() };
	}
	if (info.butts) {
		if (uncen) {
			return { t: 'obutts' };
		}
		return { t: 'text', text: v.butts() };
	}
	if (info.oleg) {
		if (uncen) {
			return { t: 'tgPhoto', fileId: v.nooleg() };
		}
		if (info.nowFriday) {
			return { t: 'giphy', tag: 'bodybuilder' };
		}
		return { t: 'text', text: v.oleg() };
	}
	if ((info.borisich || info.com) && info.good) {
		return { t: 'tgPhoto', fileId: v.borisich() };
	}
	return { t: 'none' };
}
