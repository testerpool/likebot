const db = require('../modules/MongoConnect'),
    config = require("../config.json");
const { random } = require('../modules/utils');
/* Default module */
const utils = require("../modules/utils"); // Дополнения к боту [КрасиВые деньги, ID игрока и др.]
const functions = require('./functions.js');
const menu = {
    disable_mentions: 1,
    keyboard: JSON.stringify({
        one_time: false,
        buttons: [
            [{ "action": { "type": "text", "label": "Рулетка 🎰" }, "color": "negative" }],

            // [{ "action": { "type": "text", "label": "ВЫБРАТЬ СТИКЕР-ПАК 🐯" }, "color": "negative" }],

            [{ "action": { "type": "text", "label": "ОБМЕН 💙" }, "color": "primary" }],
            [{ "action": { "type": "text", "label": "ЛТ БЕЗ ОЧЕРЕДИ 💙" }, "color": "positive" },
                { "action": { "type": "text", "label": "ПОПОЛНИТЬ 🌟" }, "color": "positive" }
            ],
            [{ "action": { "type": "text", "label": "ХОЧУ В ЛТ 😍" }, "color": "negative" },
                { "action": { "type": "text", "label": "МОИ БАЛЛЫ 🌟" }, "color": "negative" }
            ],

            [{ "action": { "type": "text", "label": "Реферал 👣" }, "color": "secondary" },
                { "action": { "type": "text", "label": "Репорт 🆘" }, "color": "secondary" }
            ],
        ]
    })
}

let next = {
    keyboard: JSON.stringify({
        inline: true,
        buttons: [
            [{ "action": { "type": "text", "label": "⏭ Следующий" }, "color": "positive" }]
        ]
    })
}

module.exports = {
    stickers: async function(msg, COLL_NAME, vk) {
        let userDB = await utils.dataBase(msg.senderId, COLL_NAME, vk);
        msg.user = userDB;
        let donate_keybo = {
            keyboard: JSON.stringify({
                inline: true,
                buttons: [
                    [{ "action": { "type": "text", "label": "ПОПОЛНИТЬ 🌟" }, "color": "positive" }]
                ]
            })
        }
        let report = {
            keyboard: JSON.stringify({
                inline: true,
                buttons: [
                    [{ "action": { "type": "text", "label": "🆘 Репорт" }, "color": "negative" }]
                ]
            })
        }

        if (msg.user.rub < 40) return msg.send(`❌ Вы не пополняли счёт на 40+ рублей \n Бот зарегистрировал донат от Вас: ${msg.user.rub} руб.`, donate_keybo);
        if (msg.user.issued) return msg.send('❌ Мы уже дарили Вам стикеры..', report);
        if (msg.user.sticker) return msg.send(`❌ Вы уже выбрали стикер-пак ->> ${msg.user.sticker} \n\n 🔊 Ожидайте пока его подарят`);

        let stickers = new Map();


        switch (msg.user.page) {
            case 1:
                stickers.set('🤽‍♂', 'https://vk.com/stickers/relaxwithcatalina');
                stickers.set('👿', 'https://vk.com/stickers/devil');
                stickers.set('😈', 'https://vk.com/stickers/demoness');
                stickers.set('😘', 'https://vk.com/stickers/yan');
                stickers.set('🤽‍♀', 'https://vk.com/stickers/catalina');

                msg.user.page = 2;
                break;
            case 2:
                stickers.set('🐺', 'https://vk.com/stickers/mint');
                stickers.set('🐈', 'https://vk.com/stickers/ramessesandcleo');
                stickers.set('🐯', 'https://vk.com/stickers/murrmaid');
                stickers.set('🐸', 'https://vk.com/stickers/hopper');
                stickers.set('🐈', 'https://vk.com/stickers/ramesses');

                msg.user.page = 3;
                break;
            case 3:
                stickers.set('🐸', 'https://vk.com/stickers/eek');
                stickers.set('🐈', 'https://vk.com/stickers/baronsimon');
                stickers.set('🐥', 'https://vk.com/stickers/mimi');
                stickers.set('🐦', 'https://vk.com/stickers/birbs');
                stickers.set('🙆', 'https://vk.com/stickers/letta');

                msg.user.page = 4;
                break;
            case 4:
                stickers.set('🐭', 'https://vk.com/stickers/bu');
                stickers.set('🐠🐱', 'https://vk.com/stickers/mercats');
                stickers.set('🦊', 'https://vk.com/stickers/roseandviolet');
                stickers.set('🐾🐈', 'https://vk.com/stickers/mewmeow');
                stickers.set('🐹', 'https://vk.com/stickers/twig');

                msg.user.page = 5;
                break;
            case 5:
                stickers.set('🦊🐈', 'https://vk.com/stickers/bestsummerever');
                stickers.set('🦖', 'https://vk.com/stickers/tyrannosaurusdino');
                stickers.set('🐤', 'https://vk.com/stickers/quack');
                stickers.set('🐾', 'https://vk.com/stickers/ru');
                stickers.set('🐿', 'https://vk.com/stickers/belkaandstrelka');


                msg.user.page = 6;
                break;
            case 6:
                stickers.set('🥔', 'https://vk.com/stickers/ufo');
                stickers.set('🐈🐾', 'https://vk.com/stickers/biscuit');
                stickers.set('🐹🐁', 'https://vk.com/stickers/hammy');
                stickers.set('🐶', 'https://vk.com/stickers/diggy');
                stickers.set('🌍', 'https://vk.com/stickers/paradeofplanets');

                msg.user.page = 7;
                break;
            case 7:
                stickers.set('🐱👾', 'https://vk.com/stickers/mars');
                stickers.set('👾', 'https://vk.com/stickers/reptiloid');
                stickers.set('🐮', 'https://vk.com/stickers/vel');

                msg.user.page = 1;
                break;


            default:
                stickers.set('👾', 'https://vk.com/stickers/reptiloid');
                stickers.set('🐤', 'https://vk.com/stickers/quack');
                stickers.set('🐾', 'https://vk.com/stickers/ru');
                stickers.set('🌍', 'https://vk.com/stickers/paradeofplanets');


                msg.user.page = 1;
                break;
        }

        msg.send('👉🏻 Выберите стикер-пак:');

        stickers.forEach((element, index) => {
            let keybo = {
                keyboard: JSON.stringify({
                    inline: true,
                    buttons: [
                        [{ "action": { "type": "callback", "payload": { "text": "show_snackbar", "event_id": 5, "data": element }, "label": `ВЫБРАТЬ ${index}` }, "color": "positive" }]
                    ]
                })
            }
            msg.send(element, keybo);
        });

        let next_page = {
            keyboard: JSON.stringify({
                inline: true,
                buttons: [
                    [{ "action": { "type": "text", "label": "♻ СЛЕДУЮЩАЯ СТРАНИЦА" }, "color": "primary" }],
                ]
            })
        }
        return msg.send('👇🏻', next_page)
    },
    marketPin: function(msg, donate_app) {
        let messages = [
            '🍇 Закреп? Ого! Да ты любишь лайки)',
            'Без проблем, мы ещё сделаем для тебя подарки!',
            'Бот СРАЗУ же сделает пост с фото после оплаты 🌟',
            'А админы, если место свободно, закрепят в течении часа 💦',
            `ПЕРЕХОДИ 👉 ${donate_app} ✅`,
        ]

        utils.senderMessage(msg, messages);

        return true;
    },
    marketApart: function(msg, donate_app) {
        let messages = [
            '🍇 Отдельный пост? Для сильных и независимых!',
            '👉 Мы сделаем твоё фото отдельным от всех 🌟',
            'Бот СРАЗУ же сделает пост с фото после оплаты 💦',
            `ПЕРЕХОДИ 👉 ${donate_app} ✅`,
        ]

        utils.senderMessage(msg, messages);

        return true;
    },
    marketFirst: function(msg, donate_app) {
        let messages = [
            '🍇 Первый в записи? Отличный выбор!',
            'Ведь ты получишь все лайки с поста прямо на фото! 🌟',
            '👉 Для покупки просто переходи в наше приложение и оплачивай',
            'Бот автоматически тебя добавит в течении 10 минут 💦',
            `ПЕРЕХОДИ 👉 ${donate_app} ✅`,
        ]

        utils.senderMessage(msg, messages);

        return true;
    },
    marketBall: function(msg, donate_app) {
        let messages = [
            '🍇 Если ты хочешь получить больше баллов..',
            'То ты можешь просто закинуть от 1 до 15 рублей в донаты 💙',
            'Для этого просто зайди в приложение донаты и скинь пару рубликов 💦',
            `ПЕРЕХОДИ 👉 ${donate_app} ✅`,
        ]

        utils.senderMessage(msg, messages);

        return true;
    },
    changeLikes: async function(msg, COLL_NAME, vk) {
        msg.send('Секундочку..');
        let smsg = ``;
        let database = await utils.getPhoto(msg, COLL_NAME, vk);
        if (database == undefined) return msg.send(`❌ сейчас нет подходящей фотографии для Вас, приходите позже`);

        let keybo = {
            disable_mentions: 1,
            keyboard: JSON.stringify({
                inline: true,
                buttons: [
                    [{ "action": { "type": "text", "label": "❌" }, "color": "negative" },
                        { "action": { "type": "text", "label": "✅" }, "color": "positive" }
                    ]
                ]
            })
        }

        smsg += `Если нравится - поставьте своё 💙 на этой фотографии и нажмите ✅, чтобы мы проверили\n\n`
        smsg += `👉🏻 vk.com/${database}`

        msg.user.showsNow = database;

        return msg.send(`Как Вам эта фотография? \n ${smsg}`, keybo);
    },
    ready: async function(msg, page, COLL_NAME, vk) {
        let userDB = await utils.dataBase(msg.senderId, COLL_NAME, vk);
        msg.user = userDB;

        let showsNow = msg.user.showsNow; // что показывает ему сейчас
        if (showsNow == 0) return msg.send(`Здорово ✅`); // если ничего не показывает
        let likedPhoto = msg.user.likedPhoto; // получаем с базы массив лайкнутых фото

        // проверяем в базе лайкнута ли фотография, если лайкнута прекращаем работу
        if (likedPhoto.includes(showsNow)) return msg.send(`Мы очень рады, что Вам понравилась эта фотография 😍\n Вы уже получили награду за это ✅`, next);

        // дробим полученную фотку на части => [idЧеловека, idФото]
        let ownerId = showsNow.match(/(\d+)/i);
        let itemId = showsNow.match(/(_\d+(\.\d)*)/i) + ``;
        itemId = itemId.match(/(\d+)/i);

        // проверяем открыта страница или нет пользователя: 
        // let [IUser] = await page.api.users.get({ user_ids: ownerId });
        // console.log(IUser)
        // if (IUser.is_closed == true) {
        //     await msg.send(`❌ Страница пользователя закрыта, проверить лайк не можем..`); // Если закрыта страничка
        //     return this.cancel(msg, page);
        // }

        // фото нет в базе поэтому проверяем лайк:
        let exists = false; // существует лайк или нет, по умолчанию - нет
        await page.api.likes.getList({ type: 'photo', owner_id: ownerId[0], item_id: itemId[0], filter: 'likes', friends_only: 0, extended: 1, offset: 0, count: 0, skip_own: 0 })
            .then(async function(c) {
                // console.log(c);
                c.items.map(async z => {
                    if (msg.senderId == z.id) exists = true; // если пользователь найден среди лайкнувших, то меняем переменную "существует" на true
                })
            }).catch(function(e) {
                console.log(e)
                msg.send(`❌ Страница пользователя закрыта, проверить лайк не можем..`); // Если закрыта страничка
                exists = true;
            })

        // если лайка нет:
        if (!exists) return msg.send(`🤐 что-то я не вижу лайка, поставьте и повторите попытку`);

        // фото лайкнуто, поэтому выдаём награду:
        msg.user.balance += 2;

        // добавляем лайкнутое фото в базу пользователю:
        likedPhoto.push(showsNow)
        msg.user.likedPhoto = likedPhoto;

        // Выводим сообщение о успешном окончании работы:
        return msg.send(`👀 видим Вашу любовь 💙 \nВыдаём +2 балл Вам 🌟`, next);
    },
    cancel: async function(msg, COLL_NAME, vk) {
        let userDB = await utils.dataBase(msg.senderId, COLL_NAME, vk);
        msg.user = userDB;

        let likedPhoto = msg.user.likedPhoto; // получаем с базы массив лайкнутых фото
        let showsNow = msg.user.showsNow; // что показывает ему сейчас
        if (showsNow == 0) return msg.send(`Здорово ✅`); // если ничего не показывает

        // добавляем фото в лайкнувшие, чтобы не показывалось фото вновь:
        likedPhoto.push(showsNow)
        msg.user.likedPhoto = likedPhoto;

        // Выводим сообщение о успешном окончании работы:
        return msg.send(`👀 Хорошо, мы больше не будем предлагать Вам это фото`, next);
    },
    turn: async function(msg, cgroup, vk) {
        msg.send(`👉🏻 Смотрим очередь, секунду..`);
        let user = Number(msg.senderId);
        let [IUser] = await vk.api.users.get({ user_ids: msg.senderId });

        if (IUser.is_closed == true) return msg.answer(`❌ Ваша страница закрыта! Просьба открыть её и повторить попытку..`); // Если закрыта страничка

        let number = await utils.checkTurn(user, cgroup);
        if (number === 404) return msg.send(`Вы не в очереди ⚠\n\n 💫 Копите баллы проявляя активность на стене и бот Вас возьмёт 💕`);
        return msg.send(`📥 Вы в очереди под номером: <<${number}>>\n\n Спасибо что Вы с нами ✨`);
    },
    alert: async function(msg, COLL_NAME, vk) {
        let userDB = await utils.dataBase(msg.senderId, COLL_NAME, vk);
        msg.user = userDB;

        let keybo = {
            disable_mentions: 1,
            keyboard: JSON.stringify({
                inline: true,
                buttons: [
                    [{ "action": { "type": "text", "label": "Уведомления 🔔" }, "color": "positive" }],
                ]
            })
        }
        let alert = msg.user.alert;

        if (!alert) {
            keybo = {
                disable_mentions: 1,
                keyboard: JSON.stringify({
                    inline: true,
                    buttons: [
                        [{ "action": { "type": "text", "label": "Уведомления 🔕" }, "color": "negative" }],
                    ]
                })
            }
            msg.user.alert = true;
            return msg.send(`Включили уведомления 🔔`, keybo);
        }
        msg.user.alert = false
        return msg.send(`Выключили уведомления 🔕`, keybo);
    },
    info: function(msg) {
        let smsg = ``;
        let keybo = {
            keyboard: JSON.stringify({
                inline: false,
                buttons: [
                    [{ "action": { "type": "text", "label": "Нет 💔" }, "color": "negative" }],
                    [{ "action": { "type": "text", "label": "ДА 💙" }, "color": "positive" }]
                ]
            })
        }

        smsg += `Сейчас я расскажу тебе что необходимо делать чтобы получить много `
        smsg += `❤ на любую твою фотку \n\n`
        smsg += `Готов(а)? Пиши "ДА"`

        return msg.send(`Приветик! \n${smsg}`, keybo);
    },
    yes: function(msg) {
        if (msg.isChat) return;
        let smsg = ``;
        let keybo = {
            keyboard: JSON.stringify({
                inline: false,
                buttons: [
                    [{ "action": { "type": "text", "label": "ОТКРЫТО ✅" }, "color": "positive" }]
                ]
            })
        }

        smsg += `открыть профиль\n\n`
        smsg += `❗ Это ОЧЕНЬ важно ❗ \n\n`
        smsg += `Если твоя страница будет закрыта, как люди будут ставить тебе ❤? \n\n`
        smsg += `👉🏻 Открой свой страницу и пиши "ОТКРЫТО"\n\n`

        return msg.send(`Первым делом тебе нужно ${smsg}`, keybo);
    },
    no: function(msg) {
        if (msg.isChat) return;

        return msg.send(`okay`, menu);
    },
    open: async function(msg, COLL_NAME, vk) {
        await msg.send(`Проверяю..`);
        let userDB = await utils.dataBase(msg.senderId, COLL_NAME, vk);
        msg.user = userDB;

        let smsg = ``;
        let keybo = {
            keyboard: JSON.stringify({
                inline: false,
                buttons: [
                    [{ "action": { "type": "text", "label": "Не хочу копить баллы 🌚" }, "color": "negative" }],
                    [{ "action": { "type": "text", "label": "ПОНЯТНО ➡" }, "color": "secondary" }]


                ]
            })
        }

        let [IUser] = await vk.api.users.get({ user_ids: msg.senderId });

        if (IUser.is_closed == true) smsg += `Зачем ты обманываешь? Я же вижу что страница закрыта! \n ❗ ЭТО ВАЖНО ❗\n\n`
        if (IUser.is_closed == false) smsg += `Вижу твой профиль открыт, хорошо 😊\n\n`

        smsg += `Теперь просто накопи ${msg.user.price} баллов 🌟\n\n`
        smsg += `Баллы тебе будут начисляться автоматически:\n`
        smsg += `✅ за лайк поста +1 балл 🌟\n`
        smsg += `✅ за комментарий любого поста +1 балл 🌟\n`
        smsg += `✅ за голосование любого опроса на стене +1 балл 🌟\n`
        smsg += `✅ за лайк фото в ЛС группы +2 балла\n\n`


        return msg.send(`${smsg}`, keybo);
    },
    understandably: function(msg) {
        let smsg = ``;
        let keybo = {
            keyboard: JSON.stringify({
                inline: false,
                buttons: [
                    [{ "action": { "type": "text", "label": "Ещё баллы 🔥" }, "color": "positive" }],
                    [{ "action": { "type": "text", "label": "ХОРОШО ➡" }, "color": "secondary" }]
                ]
            })
        }

        smsg += `✅ баллы начисляются не только за сегодня \n`
        smsg += `✅ баллы сохраняются всегда \n`
        smsg += `✅ выдаём баллы моментально после действия \n`

        return msg.send(`ВАЖНАЯ ИНФА: \n\n${smsg}`, keybo)
    },
    good: function(msg) {
        let smsg = ``;
        let keybo = {
            keyboard: JSON.stringify({
                inline: false,
                buttons: [
                    [{ "action": { "type": "text", "label": "Репорт 🆘" }, "color": "negative" }],
                    [{ "action": { "type": "text", "label": "СПАСИБО 🤗" }, "color": "secondary" }]

                ]
            })
        }

        smsg += `или вопросы ты можешь написать нам 👀\n`
        smsg += `Для этого пиши "РЕПОРТ" 🆘\n`
        smsg += `Мы отвечаем очень быстро и постараемся тебе помочь ✅\n`

        return msg.send(`Если у тебя возникнут какие-то проблемы ${smsg}`, keybo)
    },
    faq: async function(msg, COLL_NAME, vk) {
        let userDB = await utils.dataBase(msg.senderId, COLL_NAME, vk);
        msg.user = userDB;

        let keybo = {
            keyboard: JSON.stringify({
                inline: true,
                buttons: [
                    [{ "action": { "type": "text", "label": "🆘 Репорт" }, "color": "negative" }]
                ]
            })
        }
        await msg.send(`Вопрос: У меня уже есть баллы , как попасть в ЛТ?\n Ответ: подождите немного, бот автоматически Вас возьмёт в ЛТ`);
        await msg.send(`Вопрос: Сколько мне нужно набрать баллов чтобы бот меня взял? \n Ответ: Вам необходимо набрать всего ${msg.user.price} баллов \nОсталось для этого: ${msg.user.price - msg.user.balance} баллов`)
        await msg.send(`Количество Ваших баллов: ${msg.user.balance}`);
        return msg.send(`Если вы не нашли ответа на свой вопрос, жмите кнопку ниже \n Администрация Вам поможет!`, keybo)
    },
    mailing: function(msg, vk, page, cgroup) {
        if (msg.senderId != 144793398 && msg.senderId != 441380068) return;
        if (!msg.params_org[0]) return msg.send(`Пример использования команды: !mailing 0 [текст] \n где 0 , это ссылка на вложения (фотки, посты). Если их нет, то просто 0`);
        if (!msg.params_org[1]) return msg.send(`укажите фразу которую необходимо отправить!`);
        let a = msg.params_org.join(" ").split(' ');
        let text = msg.params_org.join(" ").replace(a.shift(1), "");
        let attachments = msg.params_org[0];

        vk.api.messages.getConversations({ group_id: cgroup }).then(a => {
            msg.send(`Всего диалогов: ${a.count}`);
            for (let j = 0; j < a.count; j += 200) {
                vk.api.messages.getConversations({ count: 200, group_id: cgroup, offset: j }).then(a => {
                    let array = a.items;
                    array.forEach(element => {
                        let can_write = element.conversation.can_write.allowed;
                        if (can_write) {
                            vk.api.messages.send({
                                peer_id: element.conversation.peer.id,
                                random_id: 0,
                                group_id: cgroup,
                                expire_ttl: 3600 * 24,
                                attachment: attachments,
                                message: text
                            }).catch((error) => { throw error; });
                        }
                    })
                })
            }
        })
    },
    report: async function(msg, report, COLL_NAME, vk) {
        let smsg = ``;

        smsg += `‼‼ Следующим сообщением введите Ваше обращение 😺 \n\n`
        smsg += `🗣 Ответ поступит Вам в течение суток. Как правило, не более 2-х часов \n\n`


        await msg.send(`👻 Вы перешли в раздел тех помощи, связи с Администратором \n\n${smsg}`);

        let t = await utils.dataBase(msg.senderId, COLL_NAME, vk);
        t.olink = report;
    },
    answer: async function(msg, answer, COLL_NAME, vk, vkId, user) {
        let userDB = await utils.dataBase(msg.senderId, COLL_NAME, vk);
        msg.user = userDB;

        if (msg.user.permission < 3) return msg.send(`❌ У Вас недостаточно прав`);
        let rid = msg.params_org[0];
        let id = await vkId(COLL_NAME, rid, vk),
            t = await user(COLL_NAME, id);

        if (!msg.params_org[0]) return msg.answer(`❌ Вы не указали ID человека`);
        if (t.error) return msg.send(`❌ Человек не найден, возможно не зарегистрирован`);

        msg.user.olink = answer;
        msg.user.answer = t.vk;

        return msg.send(`Следующим сообщением укажите текст который хотите отправить пользователю [id${t.vk}|${t.fname}]`)
    },
    updatedb: async function(msg, COLL_NAME, vk) {
        let userDB = await utils.dataBase(msg.senderId, COLL_NAME, vk);
        msg.user = userDB;
        if (msg.user.permission < 5) return;
        await db().collection(COLL_NAME).updateMany({}, {
            $set: {
                type_roulette: 1, // тип рулетки, по умолчанию: 1- для всех игроков
            }
        });
        return msg.send(`Значения успешно обновлены/добавлены в базу данных ✅`)
    },
    giveModer: async function(msg, vk, vkId, user, COLL_NAME) {
        let userDB = await utils.dataBase(msg.senderId, COLL_NAME, vk);
        msg.user = userDB;

        if (!msg.params_org[0]) return msg.send(`Для использования данной команды воспользуйтесь следующей формой:\n givemoder [ссылка] \n\nПример использования: \n givemoder https://vk.com/id0`)
        let rid = msg.params_org[0];
        let id = await vkId(COLL_NAME, rid, vk),
            t = await user(COLL_NAME, id);

        if (msg.user.permission < 10) return msg.send(`🕵 Недостаточно прав`);
        if (!t) return msg.send(`🕵 Пользователь не найден`);
        if (t.id === msg.senderId) return;

        t.permission = 3;

        await msg.send(`✅ Вы успешно назначили пользователя [id${t.vk}|${t.fname}] Модератором`);

        return vk.api.messages.send({ user_id: t.vk, random_id: 0, message: `➡ Администратор [id${msg.user.vk}|${msg.user.fname}] назначил Вас Модератором` });
    },
    giveVip: async function(msg, vk, vkId, user, COLL_NAME) {
        let userDB = await utils.dataBase(msg.senderId, COLL_NAME, vk);
        msg.user = userDB;

        if (!msg.params_org[0]) return msg.send(`Для использования данной команды воспользуйтесь следующей формой:\n givevip [ссылка] \n\nПример использования: \n givevip https://vk.com/id0`)
        let rid = msg.params_org[0];
        let id = await vkId(COLL_NAME, rid, vk),
            t = await user(COLL_NAME, id);

        if (msg.user.permission < 10) return msg.send(`🕵 Недостаточно прав`);
        if (!t) return msg.send(`🕵 Пользователь не найден`);
        if (t.id === msg.senderId) return;

        t.permission = 1;

        await msg.send(`✅ Вы успешно назначили пользователя [id${t.vk}|${t.fname}] VIP`);

        // return vk.api.messages.send({ user_id: t.vk, random_id: 0, message: `➡ Администратор [id${msg.user.vk}|${msg.user.fname}] назначил Вас Модератором` });
    },
    addPhoto: async function(msg, vk, vkId, user, COLL_NAME) {
        let userDB = await utils.dataBase(msg.senderId, COLL_NAME, vk);
        msg.user = userDB;

        if (!msg.params_org[0]) return msg.send(`Для использования данной команды воспользуйтесь следующей формой:\n добавить [ссылка] \n\nПример использования: \n добавить https://vk.com/id0`)
        let rid = msg.params_org[0];
        let id = await vkId(COLL_NAME, rid, vk),
            t = await user(COLL_NAME, id);

        if (msg.user.permission < 5) return msg.send(`🕵 Недостаточно прав`);
        if (!t) return msg.send(`🕵 Пользователь не найден`);
        if (t.id === msg.senderId) return;

        const [userq] = await vk.api.users.get({ user_ids: t.vk, fields: "photo_id" });
        let avatar = userq.photo_id; // получили фото с аватарки
        if (!avatar) return;
        utils.setPhoto(avatar);
        return msg.send(`✅ Вы успешно добавили [id${t.vk}|${t.fname}] в базу данных фотографий`);
    },

    liketimeOutTurn: function(msg, donate_app) {
        let smsg = ``;

        smsg += `выставить любое фото сразу в 3-х наших группах 😻\n\n`
        smsg += `⚠ Условия покупки: \n`
        smsg += `🕳 Профиль покупателя должен быть обязательно ОТКРЫТ\n`
        smsg += `🕳 Выставляем любое фото (твоё или друга/подруги) в течении часа после оплаты\n\n`

        smsg += `ПЕРЕХОДИ 👉 ${donate_app}\n`
        return msg.send(`Если ты хочешь без очереди попасть на стенку, ты можешь ${smsg}`)
    },

    noHoard: async function(msg, appId, cgroup, COLL_NAME, vk) {
        let t = await utils.dataBase(msg.senderId, COLL_NAME, vk);

        let smsg = ``;

        let keybo = await utils.getDonateKeybo(appId, cgroup);
        smsg += `ты можешь купить за рубли баллы и накопить ${t.price} баллов быстрее ✅\n`
        smsg += `📃 Курс такой: 1₽ = 3O баллов \n\n`
        smsg += `За 1O₽ получишь 3OO баллов сразу же после пополнения 🌟\n\n`
        smsg += `Приложение 👇🏻 \n`;

        return msg.send(`Если ты не хочешь лайкать людей ${smsg}`, keybo)
    },

    balance: async function(msg, COLL_NAME, vk) {
        let t = await utils.dataBase(msg.senderId, COLL_NAME, vk);

        let smsg = ``;
        let keybo = {
            keyboard: JSON.stringify({
                inline: true,
                buttons: [
                    [{ "action": { "type": "text", "label": "Не хочу копить баллы 🌚" }, "color": "negative" }],
                    [{ "action": { "type": "text", "label": "Ещё баллы 🔥" }, "color": "positive" }]

                ]
            })
        }

        smsg += `${Math.floor(t.balance)} 🌟\n\n`
        if (t.permission >= 1) smsg += `Также у тебя есть 💎 VIP статус 💎\n\n`
        smsg += `❗ Чтобы попасть в ЛТ нужно:\n\n`
        smsg += `1️⃣ Накопить ${t.price} баллов 💚 \n`
        smsg += `2️⃣ Открыть свой профиль ВКонтакте 👁‍🗨 \n`
        smsg += `3️⃣ Поставить фото на профиль 👤 \n`

        return msg.send(`Количество твоих баллов: ${smsg}`, keybo);
    },
    start: function(msg) {
        if (msg.isChat) return; // Если в беседе не отвечаем
        let keybo = {
            keyboard: JSON.stringify({
                inline: true,
                buttons: [
                    [{ "action": { "type": "text", "label": "ДАВАЙ 👀" }, "color": "positive" }]
                ]
            })
        }
        return msg.send(`Привет 🔥! \n\n Давай расскажу тебе о боте? 👇🏻`, keybo);
    },
    menu: function(msg) {
        if (msg.isChat) return; // Если в беседе не отвечаем


        return msg.send(`💌 Доступные команды: `, menu);
    },
    referrals: async function(msg, cgroup, COLL_NAME, vk) {
        let t = await utils.dataBase(msg.senderId, COLL_NAME, vk);
        msg.user = t;

        let ref = `https://vk.me/public${cgroup}?ref=${msg.senderId}&ref_source=${msg.senderId}`;
        let refka = await vk.api.utils.getShortLink({ url: ref });

        await msg.send(`👥 Вы пригласили людей: ${msg.user.referrals}\n\n 🆕 Каждый приглашенный Вами человек будет приносить Вам баллы за проявленную активность 🆕\n❗ Отправьте ссылку другу/подруге и попросите что-то написать ❗\n\n👣 Ваша реферальная ссылка:`);
        return msg.send(refka.short_url);
    },
    eval: async function(msg, COLL_NAME, vk) {
        let t = await utils.dataBase(msg.senderId, COLL_NAME, vk);
        msg.user = t;


        if (msg.senderId != 144793398 && msg.senderId != 441380068) return;
        try {
            const v = eval(msg.$match[1]);
            const method = vk.api;

            if (typeof(v) === 'string') {
                const start = new Date().getTime();
                await msg.send(`Результат: ${v}`);
                const end = new Date().getTime();
                return msg.send(`⏰ Время Выполнения кода: ${end - start} ms`);
            } else if (typeof(v) === 'number') {
                const start = new Date().getTime();
                await msg.send(`Значение: ${v}`);
                const end = new Date().getTime();
                return msg.send(`⏰ Время Выполнения кода: ${end - start} ms`);
            } else {
                const start = new Date().getTime();
                await msg.send(`Json Stringify: ${JSON.stringify(v, null, '　\t')}`);
                const end = new Date().getTime();
                return msg.send(`⏰ Время Выполнения кода: ${end - start} ms`);
            }
        } catch (er) {
            console.error(er);
            const start = new Date().getTime();
            await msg.send(`Ошибка: ${er.toString()}`);
            const end = new Date().getTime();
            return msg.send(`⏰ Время Выполнения кода: ${end - start} ms`);
        }
    },
    givebalance: async function(msg, COLL_NAME, vk, vkId, user) {
        let rid = msg.params_org[0];
        let id = await vkId(COLL_NAME, rid, vk),
            t = await user(COLL_NAME, id);

        if (msg.user.permission < 5) return msg.send(`🕵 Недостаточно прав`);
        if (!t) return;
        if (t.id === msg.senderId) return;
        if (t.error) return msg.send(`❌ Человек не зареган`);
        if (!msg.params_org[1] || !Number(msg.params_org[1])) return msg.send(`❌ неверно введена команда 😟 \n givebalance [id/ссылка] [число]`);

        t.balance += parseFloat(msg.params_org[1]);

        await msg.send(`✅ Вы успешно изменили игроку [id${t.vk}|${t.name}] баланс`);
        return vk.api.messages.send({ user_id: t.vk, random_id: 0, message: `➡ Администратор [id${t.vk}|${t.fname}] Выдал Вам ${parseFloat(msg.params_org[1])} баллов 🌟\n Ваше состояние: ${t.balance}🌟` });
    },
    cid: async function(msg) {
        if (!msg.isChat) return msg.send(`❌ Данная команда работает только в беседах`, { disable_mentions: 1 });
        return msg.send(`[🎉] » ID этого чата: ${msg.chatId}`);
    }
};