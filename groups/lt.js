process.env.TZ = "Europe/Moscow"; // Часовой пояс, а Выше убрать ошибки из консоли!

/* Default module */
const roulette = require('../modules/roulette/roulette');
const utils = require("../modules/utils"); // Дополнения к боту [КрасиВые деньги, ID игрока и др.]
const cmd = require("../modules/cmd"); // Основные команды
const user = require("../modules/db/ProfileConnect"); // Профили игроков/информация!
const fs = require('fs');
const md5 = require(`md5`);
const request = require('request');
const { regDataBase, vkId, random } = require('../modules/utils');
let twidmk = new Object();
const config = require("../config/data.json");
const { VK, Keyboard, MessageContext } = require('vk-io');
const { HearManager } = require('@vk-io/hear');
const hearManager = new HearManager();
/*----------------------------------------------------------------------------------------------------------*/
/*Подключение бота к сообществу:*/
/*----------------------------------------------------------------------------------------------------------*/
// Уникальные переменные только для этого файла:
const lt = 'lt';
const group_name = lt;
const group_id = config.lt.group_id; // ID группы в которой включен бот
const vk = new VK({
    token: config.lt.group_token,
    lang: "ru",
    pollingGroupId: group_id,
    apiMode: "parallel"
});

const page = new VK({ token: config.lt.page_token });

const COLL_NAME = config.lt.dataBase;
const donate_app = config.lt.donate_app;
const donate_app_id = config.lt.donate_app_id;
const report = config.common.report;
const answer = config.common.answer;

const { updates } = vk;
/*----------------------------------------------------------------------------------------------------------*/
/*Регистрация пользователя:*/
/*----------------------------------------------------------------------------------------------------------*/
console.log("[Лайк Тайм] Бот успешно загружен!"); // Сообщение в консоль
/*----------------------------------------------------------------------------------------------------------*/
updates.startPolling();
updates.on('message', async(msg, next) => {
    if (msg.senderId < 0) return; // Игнор если пишет группа!
    if (!msg.text) return; // Игнор если не текст!
    if (/\[club164711863\|(.*)\]/i.test(msg.text)) msg.text = msg.text.replace(/\[club164711863\|(.*)\]/ig, '').trim(); // group

    msg.user = await utils.dataBase(msg.senderId, group_name);

    /**
     * Если сообщение с "маркет" или "услуги"
     */
    if (msg.hasAttachments()) {
        if (msg.attachments[0].toString() == 'market-165367966_4288523') {
            return msg.send(`💌 Донат примимаем автоматически \n\nПЕРЕХОДИ 👉 ${donate_app}`)
        }
        if (msg.attachments[0].toString() == 'market-164711863_5399019') {
            return cmd.marketBall(msg, donate_app);
        }
        if (msg.attachments[0].toString() == 'market-164711863_5399021') {
            return cmd.marketFirst(msg, donate_app);
        }
        if (msg.attachments[0].toString() == 'market-164711863_5399023') {
            return cmd.marketApart(msg, donate_app);
        }
        if (msg.attachments[0].toString() == 'market-164711863_5399024') {
            return cmd.marketPin(msg, donate_app);
        }
    }

    if (msg.referralSource && msg.referralValue) {


        if (msg.referralSource && msg.referralValue == msg.senderId) return msg.send(`⚠ Вы не можете активировать своё приглашение.`);
        if (msg.user.ref) return msg.send(`⚠ Вы уже активировали приглашение.`);

        let ui = Number(msg.referralSource);
        let id = await utils.vkId(ui, group_name),
            t = await user(COLL_NAME, id);
        if (!t) return msg.send(`⚠ Игрок не найден.`);

        t.referrals += 1;
        vk.api.messages.send({ user_id: t.vk, random_id: Math.random() * 99999, message: `✅ Ваш @id${msg.senderId} (друг) активировал вашу реферальную ссылку \n\n Теперь за проявленную активность Ваш реферал будет приносить Вам баллы 💫` });

        msg.user.ref = msg.referralSource;
        msg.user.balance += 5;
        return msg.send(`✅ Вы успешно активировали приглашение [id${t.vk}|друга], Вам было начисленно 5🌟\n`);
    }

    msg.original = msg.text
    msg.params_org = msg.original.split(" ");
    msg.params_org.shift();
    msg.params = msg.text.split(" ");
    msg.params.shift();
    msg.params_alt = msg.text.split(" ");
    console.log(`Новое сообщение от ID: ${msg.senderId}\n MSG: ${msg.text}`);
    // msg.user.lastOnline = Date.now(); // Дата последнего сообщения!

    // if (msg.user.balance < 0 || isNaN(msg.user.balance) || !isFinite(msg.user.balance)) msg.user.balance = 1

    utils.anyTime(msg, group_name);

    await next();
});

vk.updates.on('message_new', hearManager.middleware);


/*-------------------------------------------------------------------*/
/*     |                       
/*     |                        Команды      
/*     V                        
/*-------------------------------------------------------------------*/
hearManager.hear(/^(начать)$/ig, async(msg) => cmd.start(msg));
hearManager.hear(/^(Команды 📝|Меню 📝|команды|меню|начать|спасибо|СПАСИБО 🤗)$/ig, async(msg) => cmd.menu(msg));
hearManager.hear(/^(?:(Баланс 🌟|баланс|мои баллы 🌟))$/ig, async(msg) => cmd.balance(msg, group_name));
hearManager.hear(/^(?:(Не хочу копить баллы 🌚|ПОПОЛНИТЬ БАЛЛЫ 🌟|ПОПОЛНИТЬ 🌟))$/ig, async(msg) => cmd.noHoard(msg, group_name));
hearManager.hear(/^(?:(лт без очереди 💙|лт|без очереди))$/ig, async(msg) => cmd.liketimeOutTurn(msg, group_name));
hearManager.hear(/^(?:(реферал|реф|рефка|Реферал 👣))$/ig, async(msg) => cmd.referrals(msg, group_name));
// Информация:
hearManager.hear(/^(?:(ХОЧУ В ЛТ 😍|info|как|информ[ао]ция|давай 👀))$/ig, async(msg) => cmd.info(msg));
hearManager.hear(/^(?:(да 💙|д[оа]))$/ig, async(msg) => cmd.yes(msg));
hearManager.hear(/^(?:(нет 💔|нет))$/ig, async(msg) => cmd.no(msg));
hearManager.hear(/^(?:(открыто ✅|[ао]ткр[иы]т[ао]))$/ig, async(msg) => cmd.open(msg, group_name));
hearManager.hear(/^(?:(ДАЛЬШЕ ➡|дальше))$/ig, async(msg) => cmd.further(msg));
hearManager.hear(/^(?:(ПОНЯТНО ➡|понятно))$/ig, async(msg) => cmd.understandably(msg));
hearManager.hear(/^(?:(ХОРОШО ➡|хорошо))$/ig, async(msg) => cmd.good(msg));
hearManager.hear(/^(?:(ВЫБРАТЬ СТИКЕР-ПАК 🐯|♻ СЛЕДУЮЩАЯ СТРАНИЦА|Ой , нет, выберу другой ❌|выбрать стикер-пак))$/ig, async(msg) => cmd.stickers(msg));
hearManager.hear(/^(?:(Рулетка 🎰|рулетка|🐒|🍌|🍋|🍒|🍇))$/ig, async(msg) => roulette.spin(msg, group_name));


hearManager.hear(/^(?:(Уведомления 🔕|Уведомления 🔔|увед[ао]млени[ея]))$/ig, async(msg) => cmd.alert(msg));
// Проверить очередь                      
hearManager.hear(/^(?:(очередь|👤 Очередь))$/ig, async(msg) => cmd.turn(msg, group_name));

// лайки в ЛС:
hearManager.hear(/^(?:(Ещё баллы 🔥|ОБМЕН 💙|⏭ Следующий|[ао]ц[ие]нить))$/ig, async(msg) => cmd.changeLikes(msg, group_name));
hearManager.hear(/^(?:(✅))$/ig, async(msg) => cmd.ready(msg, group_name));
hearManager.hear(/^(?:(❌))$/ig, async(msg) => cmd.cancel(msg, group_name));

// Административные
hearManager.hear(/^(mailing)/ig, async(msg) => cmd.mailing(msg, group_name));
hearManager.hear(/(?:!)\s([^]+)/i, async(msg) => cmd.eval(msg, group_name));
hearManager.hear(/^(?:(givemoder))/ig, async(msg) => cmd.giveModer(msg, group_name));
hearManager.hear(/^(?:(givevip))/ig, async(msg) => cmd.giveVip(msg, group_name));
hearManager.hear(/^(?:(добавить))/ig, async(msg) => cmd.addPhoto(msg, group_name));
hearManager.hear(/^(?:(givebalance))/ig, async(msg) => cmd.givebalance(msg, group_name));
hearManager.hear(/^(updatedb)/ig, async(msg) => cmd.updatedb(msg, group_name));
hearManager.hear(/^(!личка)/ig, async(msg) => {
    if (msg.user.permission < 5) return msg.send(`❌ у Вас нет прав на эту команду!`);
    if (!msg.params_org[0]) return msg.answer(`Пример использования команды: !рассылка 0 [текст] \n где 0 , это ссылка на вложения (фотки, посты). Если их нет, то просто 0`);
    if (!msg.params_org[1]) return msg.answer(`укажите фразу которую необходимо отправить!`);
    const { collect } = vk;
    let a = msg.params_org.join(" ").split(' ');
    let text = msg.params_org.join(" ").replace(a.shift(1), "");
    let attachments = msg.params_org[0];
    const collectStream = collect.messages.getConversations({});
    collectStream.on('error', console.error);
    collectStream.on('data', ({ total, percent, received, items }) => {
        msg.send(` 
    Всего диалогов: ${total} 
    Процентов: ${percent} 
    Принято: ${received}`);
        for (i = 0; i < items.length; i++) {
            vk.api.messages.send({
                peer_id: items[i].conversation.peer.id,
                random_id: 0,
                user_id: user.vk,
                attachment: attachments,
                message: text
            }).catch((error) => { throw error; });
        }
    });
    collectStream.on('end', () => {
        return msg.send(`Все сообщения отправлены.`);
    });
});

// Репорт система
hearManager.hear(/^(?:(Репорт 🆘|репорт|баг|пр[ие]дл[ао]жить))$/ig, async(msg) => cmd.faq(msg));
hearManager.hear(/^(?:(🆘 Репорт))$/ig, async(msg) => cmd.report(msg, group_name));
hearManager.hear(/^(?:(ответ))/ig, async(msg) => cmd.answer(msg, group_name));

updates.on('message_event', async(obj) => {
    if (obj.eventPayload.event_id == report) {
        let userDB = await vkId(obj.userId, group_name),
            target = await user(COLL_NAME, userDB);

        if (obj.eventPayload.event_id == 5) {
            let sticker = obj.eventPayload.data;

            if (target.sticker) return vk.api.messages.sendMessageEventAnswer({ event_id: obj.eventId, user_id: obj.userId, peer_id: obj.peerId, event_data: JSON.stringify({ type: "show_snackbar", text: `❌ Вы уже выбрали стикер-пак` }) }) // Отображение сообщения в snackbar'е.
            if (target.issued) return vk.api.messages.sendMessageEventAnswer({ event_id: obj.eventId, user_id: obj.userId, peer_id: obj.peerId, event_data: JSON.stringify({ type: "show_snackbar", text: "❌ Вы уже получили свой стикер-пак" }) }) // Отображение сообщения в snackbar'е.

            vk.api.messages.send({
                user_id: target.vk,
                random_id: 0,
                message: `🐾 Вы выбираете стикер-пак \n${sticker}?`,
                keyboard: JSON.stringify({
                    inline: true,
                    buttons: [
                        [{ "action": { "type": "text", "label": "Ой , нет, выберу другой ❌" }, "color": "negative" }],
                        [{ "action": { "type": "callback", "payload": { "text": "show_snackbar", "event_id": 5.1, 'data': sticker }, "label": `ВСЕ ВЕРНО ✅` }, "color": "positive" }]
                    ]
                })
            })
            return vk.api.messages.sendMessageEventAnswer({
                event_id: obj.eventId,
                peer_id: obj.peerId,
                user_id: obj.userId,
                message: '‼ Перейдите в самый низ диалога ‼',
                conversation_message_id: obj.conversationMessageId,
            })
        }

        if (obj.eventPayload.event_id == 5.1) {
            let sticker = obj.eventPayload.data;
            await vk.api.messages.edit({
                    peer_id: obj.peerId,
                    message: "💦 Отличный выбор! Мы подарим Вам его в ближайшее время ⌛",
                    conversation_message_id: obj.conversationMessageId
                }) // Редактирование сообщения.
            target.sticker = sticker;
            return vk.api.messages.send({
                chat_id: 24,
                random_id: 0,
                message: `🐯 Стикеры 🐯\n\n ➡ [id${target.vk}|${target.fname}] \n 💌 Желающий стикер-пак: \n${target.sticker}`,
                keyboard: JSON.stringify({
                    inline: true,
                    buttons: [
                        [{
                            "action": {
                                "type": "callback",
                                "payload": {
                                    "text": "show_snackbar",
                                    "event_id": 5.2,
                                    'data': { "user": target.vk, 'sticker': sticker }
                                },
                                "label": "Я ВЫДАМ ✅"
                            },
                            "color": "positive"
                        }]
                    ]
                })
            })
        }

        if (obj.eventPayload.event_id == 5.2) {
            if (target.permission < 5) {
                return vk.api.messages.sendMessageEventAnswer({
                        event_id: obj.eventId,
                        user_id: obj.userId,
                        peer_id: obj.peerId,
                        event_data: JSON.stringify({ type: "show_snackbar", text: `❌ у Вас нет прав` })
                    }) // Отображение сообщения в snackbar'е.
            }
            let userId = obj.eventPayload.data.user;
            let sticker = obj.eventPayload.data.sticker;
            let id = await vkId(COLL_NAME, userId, vk),
                t = await user(COLL_NAME, id);

            t.issued = true;

            return vk.api.messages.edit({
                    peer_id: obj.peerId,
                    message: `🐾 [id${target.vk}|${target.fname}] выдаёт пользователю @id${userId} стикер пак (${sticker}) ✅`,
                    conversation_message_id: obj.conversationMessageId
                }) // Редактирование сообщения.
        }

        if (target.permission < 3) return vk.api.messages.sendMessageEventAnswer({ event_id: obj.eventId, user_id: obj.userId, peer_id: obj.peerId, event_data: JSON.stringify({ type: "show_snackbar", text: "❌ У Вас недостаточно прав" }) }) // Отображение сообщения в snackbar'е.
        let rid = obj.eventPayload.user;
        let id = await vkId(COLL_NAME, rid, vk),
            t = await user(COLL_NAME, id);


        if (t.error) return vk.api.messages.sendMessageEventAnswer({ event_id: obj.eventId, user_id: obj.userId, peer_id: obj.peerId, event_data: JSON.stringify({ type: "show_snackbar", text: "❌ Человек не найден, возможно не зарегистрирован" }) }) // Отображение сообщения в snackbar'е.

        target.olink = answer;
        target.answer = t.vk;

        return vk.api.messages.sendMessageEventAnswer({ event_id: obj.eventId, user_id: obj.userId, peer_id: obj.peerId, event_data: JSON.stringify({ type: "show_snackbar", text: `✅ Пишите что хотите ответить пользователю ${t.fname}` }) }) // Отображение сообщения в snackbar'е.
    }
});

// event
updates.on('like_add', async(obj) => utils.like_add(obj, group_name));
updates.on('poll_vote_new', async(obj) => utils.poll_vote_new(obj, group_name));
updates.on('wall_reply_new', async(obj) => utils.wall_reply_new(obj, group_name));
updates.on(['wall_post_new'], async(obj) => utils.wall_post_new(obj, group_name));


hearManager.hear(/(.*)/igm, async(msg) => { // Навигация


    let keybo = {
        disable_mentions: 1,
        keyboard: JSON.stringify({
            buttons: [
                [{ "action": { "type": "text", "label": "МЕНЮ 📝" }, "color": "secondary" }]
            ]
        })
    }

    if (msg.user.olink === report) {
        let text = msg.$match[0];
        msg.user.olink = 0;
        await msg.send('✅ Ваше сообщение отправлено. Ожидайте ответ! Мы постараемся как можно быстрее помочь Вам.');
        return vk.api.messages.send({
            chat_id: 24,
            random_id: 0,
            message: `❗ Новое обращение ❗\n\n ➡ От: [id${msg.senderId}|${msg.user.fname}] \n 💌 Сообщение: ${text}\n\n📝 Для ответа нажмите на кнопку:`,
            keyboard: JSON.stringify({
                inline: true,
                buttons: [
                    [{ "action": { "type": "callback", "payload": { "text": "show_snackbar", "event_id": report, "user": msg.user.vk }, "label": "Ответить ✅" }, "color": "positive" }]
                ]
            })
        })
    }

    if (msg.user.olink === answer) {
        let target = await utils.dataBase(msg.user.answer, group_name);

        await msg.send(`📃 [id${msg.senderId}|${msg.user.fname}] дал ответ пользователю [id${target.vk}|${target.fname}] 🍏`);
        await vk.api.messages.send({
            user_id: Number(msg.user.answer),
            random_id: 0,
            message: `🌈 Сообщение от модератора [id${msg.senderId}|${msg.user.fname}]: \n\n🗣 ${msg.$match[0]}`
        });
        msg.user.answer = 0;
        msg.user.olink = 0;
        return;
    }


    if (msg.user.olink >= 0 && !Number(msg.$match[0])) {
        if (msg.isChat) return;

        return msg.send(`ПИШИ мне "МЕНЮ" или "КОМАНДЫ" 👇🏻`, keybo);
    }

});