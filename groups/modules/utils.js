const db = require('../modules/db/MongoConnect');
const request = require("request"); // Запросы к сайтам!
const { VK, Keyboard, MessageContext } = require('vk-io');
const fs = require('fs');
const user = require("./db/ProfileConnect"); // Профили игроков/информация!
const data = require('../config/data.json');

let people = [];


module.exports = {
    /**
     * Получить фото (аватарку) по ID пользователя
     * @param {*} user_id 
     * @param {*} group 
     * @returns string - photo000_111
     */
    getPhotoWithVkid: async function(user_id, group) {
        const vk = this.getVk(group, 'page_token');
        console.log('Пришел ID чтобы получить фото -> ', user_id);
        const [userq] = await vk.api.users.get({ user_ids: user_id, fields: "photo_id" });
        return 'photo' + userq.photo_id;
    },
    senderMessage: function(msg, array, time = 2000) {
        let interval = 0;
        array.forEach(message => {
            setTimeout(() => {
                msg.send(message);
            }, interval);
            interval += time;
        });
    },
    createPostFB: async function(user_id, group) {
        let page = this.getVk(group, 'page_token'),
            cgroup = data[group].group_id;

        let message = ["лайк через несколько минут выберу в лт 😍❤", "оуоуоу лайкаем постик и попадаем в лт в 2 раза чаще ✨\n🌿лайкнул(-а)? \n пиши в комменты (p.s. некоторых возьму в закреп)🥰🤫"]
        const [userq] = await page.api.users.get({ user_ids: user_id, fields: "photo_id" });
        let avatar = userq.photo_id; // получили фото с аватарки
        let rand = this.random(0, 3);
        let pollId;

        // создаём любой опрос:
        switch (rand) {
            case 0:
                await page.api.polls.create({
                    owner_id: -cgroup,
                    question: "Сколько лет ?",
                    add_answers: JSON.stringify(["Меньше 15 😶", "15-17 🙂", "18-20 👉🏼👈🏼", "20+ 🔞"])
                }).then(function(a) {
                    console.log(a);
                    pollId = a.id;
                })
                break;

            case 1:
                await page.api.polls.create({
                    owner_id: -cgroup,
                    question: "красивая фотка?",
                    add_answers: JSON.stringify(["да 😍", "нет 🤢", "50/50 👉🏼👈🏼"])
                }).then(function(a) {
                    pollId = a.id;
                })
                break;

            case 2:
                await page.api.polls.create({
                    owner_id: -cgroup,
                    question: "встречались бы ?",
                    add_answers: JSON.stringify(["конечно 🤩", "своя половинка есть 😏", "50/50 🤓", "нет 🤨"])
                }).then(function(a) {
                    pollId = a.id;
                })
                break;

            default:
                await page.api.polls.create({
                    owner_id: -cgroup,
                    question: "оценка 🥰",
                    add_answers: JSON.stringify(["1/5 🍒", "2/5 🍒", "3/5 🍒", "4/5 🍒", "5/5 🍒"])
                }).then(function(a) {
                    pollId = a.id;
                })
                break;
        }

        // публикация поста:
        page.api.wall.post({
            owner_id: -cgroup,
            message: `${message[this.random(0, message.length - 1)]}`,
            attachments: `poll${-cgroup}_${pollId}, photo${avatar}`,
        }).then(function(a) {
            console.log(`👉🏻 vk.com/wall-${cgroup}_${a.post_id} ✅`);
        })

    },
    postPublication: async function(photo, group) {
        let cgroup = data[group].group_id,
            page = this.getVk(group, 'page_token');

        let message = ["лайк через несколько минут выберу в лт 😍❤", "оуоуоу лайкаем постик и попадаем в лт в 2 раза чаще ✨\n🌿лайкнул(-а)? \n пиши в комменты (p.s. некоторых возьму в закреп)🥰🤫"]

        console.log('Пришли данные' + photo);
        return page.api.wall.post({
            owner_id: -cgroup,
            message: message[this.random(0, message.length - 1)],
            attachments: 'photo' + photo,
        }).then(a => {
            console.log(a);
            return `vk.com/wall-${cgroup}_${a.post_id}`
        });
    },
    sendToQueue: function(id, cgroup, position = 0, preference = 0) {
        // добавление:
        let link = 'http://twidmk.com/api_promokode.php?group_id=' + cgroup + '&preference=' + preference + '&page=new_queue_lt&photo=https://vk.com/' + id + '&position=' + position + '&access_token=9c411987f964f2214e6e8dbbaefd7ac939034c2083037391ed71d3cf29dcffe38273cbca7929bd2f403bd6b213';
        request(link, function(error, response, body) { error ? console.log(error) : console.log(body) });
        // http://twidmk.com/api_promokode.php?group_id=109847065&preference=0&page=new_queue_lt&photo=https://vk.com/photo438628140_457254271&position=0&access_token=9c411987f964f2214e6e8dbbaefd7ac939034c2083037391ed71d3cf29dcffe38273cbca7929bd2f403bd6b213
    },
    like_add: async function(obj, group) {
        const COLL_NAME = data[group].dataBase,
            vk = this.getVk(group);

        const smile = ["😱", "😍", "🥰", "😘", "🙉", "😻", "🙀", "🤑", "😜", "🤪", "😏", "🤩", "🤗", "😃", "🥳"]

        const { likerId, objectId } = obj;

        // получаем пользователя в БД
        const t = await user(COLL_NAME, likerId);
        if (t.error) return this.regDataBase(likerId, group);

        // if (t.permission < 5) return;
        // получаем лайки пользователя
        let likes = t.likes; // лайкнутые фото из базы данных, arr
        if (likes.includes(objectId)) return;


        // добавляем в базу данных лайкнутый object
        likes.push(objectId);
        t.likes = likes;
        t.balance += 1; // Выдаём баллы

        // отправляем уведомление, если они включены:
        if (t.alert) await vk.api.messages.send({
            user_id: t.vk,
            random_id: 0,
            message: `💌 Даю балл за активность в группе ${smile[this.random(0, smile.length - 1)]} \n [like 💙]\n\n У тебя ${t.balance} баллов 🌟`,
            keyboard: JSON.stringify({
                inline: true,
                buttons: [
                    [{ "action": { "type": "text", "label": "Уведомления 🔕" }, "color": "negative" }],
                    [{ "action": { "type": "text", "label": "👤 Очередь" }, "color": "positive" },
                        { "action": { "type": "text", "label": "Ещё баллы 🔥" }, "color": "positive" }
                    ],
                ]
            })
        }).catch((error) => { console.log(`Ошибка при отправке сообщения: ${error}`) });
    },

    poll_vote_new: async function(obj, group) {
        const COLL_NAME = data[group].dataBase,
            vk = this.getVk(group);

        const smile = ["😱", "😍", "🥰", "😘", "🙉", "😻", "🙀", "🤑", "😜", "🤪", "😏", "🤩", "🤗", "😃", "🥳"]

        const { id, userId } = obj;

        // получаем пользователя в БД
        const t = await user(COLL_NAME, userId);
        if (t.error) return this.regDataBase(userId, group);

        // if (t.permission < 5) return;
        // получаем лайки пользователя
        let votes = t.votes; // лайкнутые фото из базы данных, arr
        if (votes.includes(votes)) return;


        // добавляем в базу данных проголосовавший object
        votes.push(id);
        t.votes = votes;
        t.balance += 1; // Выдаём баллы

        // отправляем уведомление, если они включены:
        if (t.alert) await vk.api.messages.send({
            user_id: t.vk,
            random_id: 0,
            message: `💌 Даю балл за активность в группе ${smile[this.random(0, smile.length - 1)]} \n [голосование ✅]\n\n У тебя ${t.balance} баллов 🌟`,
            keyboard: JSON.stringify({
                inline: true,
                buttons: [
                    [{ "action": { "type": "text", "label": "Уведомления 🔕" }, "color": "negative" }],
                    [{ "action": { "type": "text", "label": "👤 Очередь" }, "color": "positive" },
                        { "action": { "type": "text", "label": "Ещё баллы 🔥" }, "color": "positive" }
                    ],
                ]
            })
        }).catch((error) => { console.log(`Ошибка при отправке сообщения: ${error}`) });
    },
    wall_post_new: async function(obj, group) {
        const vk = this.getVk(group),
            donate_app = data[group].donate_app;

        let rand_message = [
            "Сможешь написать слово «ТЕЛЕЖКА» по буквам, чтобы тебя никто не перебил? 🛒",
            "Сможешь написать слово «СОЛНЦЕ» по буквам, чтобы тебя никто не перебил? ☀",
            "Сможешь написать слово «ЯБЛОКО» по буквам, чтобы тебя никто не перебил? 🍏",
            "Сможешь написать слово «НАУШНИКИ» по буквам, чтобы тебя никто не перебил? 🎧",
            "Сможешь написать слово «ПОЦЕЛУЙ» по буквам, чтобы тебя никто не перебил? 💋",
            "Сможешь написать слово «ДЕЛЬФИН» по буквам, чтобы тебя никто не перебил? 🐳",
            "Сможешь написать слово «ЛАМПОЧКА» по буквам, чтобы тебя никто не перебил? 💡",
            "Сможешь написать слово «ЗОНТИК» по буквам, чтобы тебя никто не перебил? 🌂",
            "Сможешь написать слово «МАНИКЮР» по буквам, чтобы тебя никто не перебил? 💅🏻",
            "Сможешь написать слово «ПОМАДА» по буквам, чтобы тебя никто не перебил? 💄",
            "Сможешь написать слово «КЛОУН» по буквам, чтобы тебя никто не перебил? 🤡",
            "Сможешь написать слово «КОНФЕТА» по буквам, чтобы тебя никто не перебил? 🍬",
            "Сможешь написать слово «КОМПЬЮТЕР» по буквам, чтобы тебя никто не перебил? 💻",
            "Сможешь написать своё имя по буквам, чтобы тебя никто не перебил? 👻",
            "Сможешь написать слово «КОНФЕТА» по буквам, чтобы тебя никто не перебил? 🍬",
            "Сможешь написать слово «ПОПУГАЙ» по буквам, чтобы тебя никто не перебил? 🦜",
            "Сможешь написать слово «КАКТУС» по буквам, чтобы тебя никто не перебил? 🌵",
            "Сможешь написать слово «МАШИНА» по буквам, чтобы тебя никто не перебил? 🚘",
            "Сможешь посчитать до 13, чтобы тебя никто не перебил? 🌖",
            "Сможешь написать слово «КРОССОВКИ» по буквам, чтобы тебя никто не перебил? 👟",
            "Успела поставить лик? 💓❤🗿",
            "Не забудь ❤💁‍♂",
            "Отмечай друзей 😍 и не забудь лик💖",
            `Чей комент будет последним, тому сделаю именной постик😘🥰 \n 👉🏻 ${donate_app}`,
            `😊 Прямо сейчас скидки на покупку ЛТ, переходи в Донаты группы 🚀 \n 👉🏻 ${donate_app}`,
            `💌 Если хочешь в ЛТ, но лень лайкать, кидай денюжку на развитие группы и мы возьмём тебя в ЛТ 🚀 \n 👉🏻 ${donate_app}`,
            `☺ Группа нуждается в развитии! Ваш донат продвигает наш паблик 🍓 \n 👉🏻 ${donate_app}`,
            `🥰 Если тебе нравится наш паблик, помоги материально в 'донатах' 🔥 \n 👉🏻 ${donate_app}`,
            `💙 Кинь админу на пирожок \n 👉🏻 ${donate_app}`,
            `😍 Нравится наш ЛТ? Пожертвуй копеечку на развитие \n 👉🏻 ${donate_app}`,
            `👀 Говорят, что те кто жертвует свои деняжки попадают быстрее в ЛТ \n 👉🏻 ${donate_app}`,
            `Донатишь 30 руб и попадаешь в ЛТ без очереди на 1 место. 🥳 \n 👉🏻 ${donate_app}`
        ]

        await vk.api.wall.createComment({
            owner_id: Number(obj.wall.ownerId),
            post_id: Number(obj.wall.id),
            message: `${rand_message[this.random(0, rand_message.length - 1)]}`
        });
    },
    wall_reply_new: async function(obj, group) {
        const COLL_NAME = data[group].dataBase,
            vk = this.getVk(group),
            cgroup = data[group].group_id;

        if (obj.fromId == obj.ownerId) return; // игнор если группа
        let t = await user(COLL_NAME, obj.fromId);
        if (t.error) return this.regDataBase(obj.fromId, group);

        // Если не подписчик:
        vk.api.groups.isMember({
            group_id: cgroup,
            user_id: obj.fromId,
        }).then(function(a) {
            if (a === 0) {
                if (people.includes(obj.fromId)) return;
                people.push(obj.fromId);

                return vk.api.wall.createComment({
                    owner_id: obj.ownerId,
                    post_id: obj.objectId,
                    reply_to_comment: obj.id,
                    user_id: obj.fromId,
                    message: `Я вижу ты не подписчик, подпишись!`
                });
            }
        })

        /**
         * Если это комментарий первый от пользователя
         * то выдаём ему награду - балл
         */
        let comments = t.comments;
        if (comments.includes(obj.objectId)) return;

        const comment_message = ["Даю тебе +1 балл за активность 🔥", "Лови балл за активность 💦", "🌚 Спасибо за активность, даю балл!", "Ты получаешь балл за активность 😗"]

        comments.push(obj.objectId);
        t.balance += 1;
        t.comments = comments;
        if (t.alert) vk.api.wall.createComment({
            owner_id: obj.ownerId,
            post_id: obj.objectId,
            reply_to_comment: obj.id,
            user_id: obj.fromId,
            message: `${comment_message[this.random(0, comment_message.length - 1)]} \n(в новом посту)`
        });

    },
    giveBonus: function(msg, group) {
        const page = this.getVk(group, 'page_token'),
            cgroup = data[group].group_id,
            donate_app = data[group].donate_app;

        let text = ["Донатишь 30 руб и попадаешь в ЛТ без очереди на 1 место. 🥳",
            `😊 Прямо сейчас скидки на покупку ЛТ, переходи в Донаты группы 🚀`,
            `💌 Если хочешь в ЛТ, но лень лайкать, кидай денюжку на развитие группы и мы возьмём тебя в ЛТ 🚀`,
            `☺ Группа нуждается в развитии! Ваш донат продвигает наш паблик 🍓`,
            `🥰 Если тебе нравится наш паблик, помоги материально в 'донатах' 🔥`,
            `💙 Кинь админу на пирожок`,
            `😍 Нравится наш ЛТ? Пожертвуй копеечку на развитие`,
            `👀 Говорят, что те кто жертвует свои деняжки попадают быстрее в ЛТ`,
            `Донатишь 30 руб и попадаешь в ЛТ без очереди на 1 место. 🥳`
        ];
        page.api.messages.send({ user_id: msg.user.vk, group_id: cgroup, message: `${text[this.random(0, text.length - 1)]}\n\n👉🏻 ${donate_app}`, expire_ttl: 60 * 5, random_id: 0 })
            .catch((err) => console.log(err));

        msg.user.balance += 10;
        //return msg.send(`💌 Вы получили ежедневный бонус +10 баллов 🍓 \n\n Спасибо что Вы с нами 🥰`);
        return page.api.messages.send({ user_id: msg.user.vk, group_id: cgroup, message: `💌 Вы получили ежедневный бонус +10 баллов 🍓 \n\n Спасибо что Вы с нами 🥰`, random_id: 0 })
            .catch((err) => console.log(err));

    },
    anyTime: async function(msg, group) {

        let t = await this.dataBase(msg.senderId, group);
        msg.user = t;

        // функции на каждый день
        let date = new Date().getDate();
        if (date != t.lastOnline) {
            t.lastOnline = date; // Дата последнего сообщения!
            this.giveBonus(msg, group);
        }
    },
    dataBase: async function(userId, group) {
        const COLL_NAME = data[group].dataBase;

        let t = await user(COLL_NAME, userId);
        if (t.error) {
            let NewUser = await db().collection(COLL_NAME).findOne({ vk: userId });
            if (!NewUser) await this.regDataBase(userId, group);
            t = await user(COLL_NAME, userId);
        }
        return t;
    },
    vipUpdate: async function(group) {
        const COLL_NAME = data[group].dataBase,
            vk = this.getVk(group);

        let users = await db().collection(COLL_NAME).find({ "permission": { $gte: 1 } }).toArray(); // получаем людей с VIP статусом

        // return console.log(users[0].vk);
        // добавление/обновление фото для обмена в ЛС группы
        for (let i = 0; i < users.length; i++) {
            const [userq] = await vk.api.users.get({ user_ids: users[i].vk, fields: "photo_id" });
            let avatar = userq.photo_id; // получили фото с аватарки
            this.setPhoto(avatar);

        }
    },
    setPhoto: async function(photo, donate = 0, count = 0, groups = []) {
        console.log(photo);
        // дробим полученную фотку на части => [idЧеловека, idФото]
        let ownerId = photo.match(/(\d+)/i);
        let itemId = photo.match(/(_\d+(\.\d)*)/i) + ``;
        itemId = itemId.match(/(\d+)/i);
        ownerId = Number(ownerId[0]); // берём первый элемент массива и преобразовываем в Int
        itemId = Number(itemId[0]);


        let photoDB = await db().collection("photo").find({ "vk": ownerId }).toArray(); // массив фото в базе данных

        // если фотки нет:
        if (photoDB.length == 0) {

            console.log(`Пользователя нет, создаю`)
            db().collection("photo").insertOne({
                // Информация об игроке:
                vk: ownerId, // Вконтакте
                photo: itemId, // ID фото
                donate: donate, // количество доната
                groups: groups, // группы
                additions: count, // количество попаданий/добавлений
                added: Date.now(), // время добавления
            });
        }

        // если фотка есть, обновляем данные:
        db().collection("photo").updateOne({
            vk: ownerId
        }, {
            $set: {
                photo: itemId, // ID фото
                donate: donate, // количество доната
                groups: groups, // группы
                additions: count, // количество попаданий/добавлений
                added: Date.now(), // время добавления
            }
        })

    },
    getPhoto: async function(msg) {
        Array.prototype.diff = function(a) {
            return this.filter(function(i) { return a.indexOf(i) < 0; });
        };

        let likedPhoto = msg.user.likedPhoto; // получаем массив лайкнутых фотографий
        let photoDB = await db().collection("photo").find().sort({ "added": -1 }).toArray(); // массив фото в базе данных
        photoDB = photoDB.map((user, i) => {
            return `photo${user.vk}_${user.photo}`
        });

        let photos = photoDB.diff(likedPhoto);

        return photos[0];
    },
    doRequest: function(link) {
        return new Promise(function(resolve, reject) {
            request(link, function(error, res, body) {
                if (!error && res.statusCode == 200) {
                    let number = JSON.parse(body);
                    if (number.turn == "null") return resolve(404);
                    resolve(Number(number.turn));
                } else {
                    reject(error);
                }
            });
        });
    },
    checkTurn: async function(user, cgroup) {
        let link = 'http://twidmk.com/api_promokode.php?group_id=' + cgroup + '&page=search_queue_lt&photo=https://vk.com/id' + user + '&access_token=9c411987f964f2214e6e8dbbaefd7ac939034c2083037391ed71d3cf29dcffe38273cbca7929bd2f403bd6b213'
        let answer = await this.doRequest(link);
        return answer;
    },
    regDataBase: async function(id_user, group) { // регистрация пользователя
        const COLL_NAME = data[group].dataBase,
            vk = this.getVk(group);

        let NewUser = await db().collection(COLL_NAME).findOne({ vk: id_user });
        if (!NewUser) {
            console.log(`Регистрирую пользователя с ID ${id_user} в базу данных ${COLL_NAME}`)
            let [IUser] = await vk.api.users.get({ user_ids: id_user });
            db().collection(COLL_NAME).insertOne({
                // Информация об игроке:
                vk: id_user, // Вконтакте
                fname: IUser.first_name, // Имя
                lname: IUser.last_name, // Фамилия 
                // Информация о действиях
                likes: [0], // лайкнутые посты
                votes: [0], // проголосовавшие посты
                comments: [0], // лайкнутые посты
                likedPhoto: [0], // лайкнутые фотографии
                showsNow: 0, // показывает фото сейчас 
                balance: 0, // Баланс
                rub: 0, // задоначено рублей
                issued: false, // выдана награда или нет
                sticker: false, // выбран стикер-пак или нет
                page: 0, // для пагинации
                price: 200, // Необходимое количество баллов для попадания в ЛТ
                permission: 0, // Уровень прав по умолчанию
                mailing: true, // Рассылка
                alert: true, // Оповещение
                quest: false, // Квест
                ref: 0, // Реферал
                referrals: 0, // Количество рефералов
                roulette: 0, // Время рулетки
                type_roulette: 1, // тип рулетки, по умолчанию: 1- для всех игроков
                answer: 0, // Ответ
                olink: 0, // Параметр для menu
                lastOnline: new Date().getDate(), // Последний заход
                lastDonate: "None" // дата последнего доната
            });
        }
    },
    /**
     * Запускает рандом рулетки
     * @returns object {keybo, boolean: win}
     */
    randomRoulette: async function() {
        let tape = ["🐒", "🍇", "🍌", "🍋", "🍒"];

        let key1 = tape[this.random(0, tape.length - 1)];
        let key2 = tape[this.random(0, tape.length - 1)];
        let key3 = tape[this.random(0, tape.length - 1)];
        let key4 = tape[this.random(0, tape.length - 1)];
        let key5 = tape[this.random(0, tape.length - 1)];
        let key6 = tape[this.random(0, tape.length - 1)];
        let key7 = tape[this.random(0, tape.length - 1)];
        let key8 = tape[this.random(0, tape.length - 1)];
        let key9 = tape[this.random(0, tape.length - 1)];

        let keybo = { // клавиатура по умолчанию
            disable_mentions: 1,
            keyboard: JSON.stringify({
                inline: true,
                buttons: [
                    [{ "action": { "type": "text", "label": `${key1}` }, "color": "secondary" },
                        { "action": { "type": "text", "label": `${key2}` }, "color": "secondary" },
                        { "action": { "type": "text", "label": `${key3}` }, "color": "secondary" }
                    ],
                    [{ "action": { "type": "text", "label": `${key4}` }, "color": "secondary" },
                        { "action": { "type": "text", "label": `${key5}` }, "color": "secondary" },
                        { "action": { "type": "text", "label": `${key6}` }, "color": "secondary" }
                    ],
                    [{ "action": { "type": "text", "label": `${key7}` }, "color": "secondary" },
                        { "action": { "type": "text", "label": `${key8}` }, "color": "secondary" },
                        { "action": { "type": "text", "label": `${key9}` }, "color": "secondary" }
                    ]
                ]
            })
        }

        let win = false;
        if (key1 == key4 && key4 == key7 ||
            key1 == key2 && key2 == key3 ||
            key1 == key5 && key5 == key9 ||
            key2 == key5 && key5 == key8 ||
            key3 == key6 && key6 == key9 ||
            key3 == key5 && key5 == key7 ||
            key4 == key5 && key5 == key6 ||
            key7 == key8 && key8 == key9) {
            if (key1 == key4 & key4 == key7) {
                keybo = {
                    disable_mentions: 1,
                    keyboard: JSON.stringify({
                        inline: true,
                        buttons: [
                            [{ "action": { "type": "text", "label": `${key1}` }, "color": "negative" },
                                { "action": { "type": "text", "label": `${key2}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key3}` }, "color": "secondary" }
                            ],
                            [{ "action": { "type": "text", "label": `${key4}` }, "color": "negative" },
                                { "action": { "type": "text", "label": `${key5}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key6}` }, "color": "secondary" }
                            ],
                            [{ "action": { "type": "text", "label": `${key7}` }, "color": "negative" },
                                { "action": { "type": "text", "label": `${key8}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key9}` }, "color": "secondary" }
                            ]
                        ]
                    })
                }
            }

            if (key1 == key2 & key2 == key3) {
                keybo = {
                    disable_mentions: 1,
                    keyboard: JSON.stringify({
                        inline: true,
                        buttons: [
                            [{ "action": { "type": "text", "label": `${key1}` }, "color": "negative" },
                                { "action": { "type": "text", "label": `${key2}` }, "color": "negative" },
                                { "action": { "type": "text", "label": `${key3}` }, "color": "negative" }
                            ],
                            [{ "action": { "type": "text", "label": `${key4}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key5}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key6}` }, "color": "secondary" }
                            ],
                            [{ "action": { "type": "text", "label": `${key7}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key8}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key9}` }, "color": "secondary" }
                            ]
                        ]
                    })
                }
            }

            if (key1 == key5 & key5 == key9) {
                keybo = {
                    disable_mentions: 1,
                    keyboard: JSON.stringify({
                        inline: true,
                        buttons: [
                            [{ "action": { "type": "text", "label": `${key1}` }, "color": "negative" },
                                { "action": { "type": "text", "label": `${key2}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key3}` }, "color": "secondary" }
                            ],
                            [{ "action": { "type": "text", "label": `${key4}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key5}` }, "color": "negative" },
                                { "action": { "type": "text", "label": `${key6}` }, "color": "secondary" }
                            ],
                            [{ "action": { "type": "text", "label": `${key7}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key8}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key9}` }, "color": "negative" }
                            ]
                        ]
                    })
                }
            }

            if (key2 == key5 & key5 == key8) {
                keybo = {
                    disable_mentions: 1,
                    keyboard: JSON.stringify({
                        inline: true,
                        buttons: [
                            [{ "action": { "type": "text", "label": `${key1}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key2}` }, "color": "negative" },
                                { "action": { "type": "text", "label": `${key3}` }, "color": "secondary" }
                            ],
                            [{ "action": { "type": "text", "label": `${key4}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key5}` }, "color": "negative" },
                                { "action": { "type": "text", "label": `${key6}` }, "color": "secondary" }
                            ],
                            [{ "action": { "type": "text", "label": `${key7}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key8}` }, "color": "negative" },
                                { "action": { "type": "text", "label": `${key9}` }, "color": "secondary" }
                            ]
                        ]
                    })
                }
            }

            if (key3 == key6 & key6 == key9) {
                keybo = {
                    disable_mentions: 1,
                    keyboard: JSON.stringify({
                        inline: true,
                        buttons: [
                            [{ "action": { "type": "text", "label": `${key1}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key2}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key3}` }, "color": "negative" }
                            ],
                            [{ "action": { "type": "text", "label": `${key4}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key5}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key6}` }, "color": "negative" }
                            ],
                            [{ "action": { "type": "text", "label": `${key7}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key8}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key9}` }, "color": "negative" }
                            ]
                        ]
                    })
                }
            }

            if (key3 == key5 & key5 == key7) {
                keybo = {
                    disable_mentions: 1,
                    keyboard: JSON.stringify({
                        inline: true,
                        buttons: [
                            [{ "action": { "type": "text", "label": `${key1}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key2}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key3}` }, "color": "negative" }
                            ],
                            [{ "action": { "type": "text", "label": `${key4}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key5}` }, "color": "negative" },
                                { "action": { "type": "text", "label": `${key6}` }, "color": "secondary" }
                            ],
                            [{ "action": { "type": "text", "label": `${key7}` }, "color": "negative" },
                                { "action": { "type": "text", "label": `${key8}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key9}` }, "color": "secondary" }
                            ]
                        ]
                    })
                }
            }

            if (key4 == key5 & key5 == key6) {
                keybo = {
                    disable_mentions: 1,
                    keyboard: JSON.stringify({
                        inline: true,
                        buttons: [
                            [{ "action": { "type": "text", "label": `${key1}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key2}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key3}` }, "color": "secondary" }
                            ],
                            [{ "action": { "type": "text", "label": `${key4}` }, "color": "negative" },
                                { "action": { "type": "text", "label": `${key5}` }, "color": "negative" },
                                { "action": { "type": "text", "label": `${key6}` }, "color": "negative" }
                            ],
                            [{ "action": { "type": "text", "label": `${key7}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key8}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key9}` }, "color": "secondary" }
                            ]
                        ]
                    })
                }
            }

            if (key7 == key8 & key8 == key9) {
                keybo = {
                    disable_mentions: 1,
                    keyboard: JSON.stringify({
                        inline: true,
                        buttons: [
                            [{ "action": { "type": "text", "label": `${key1}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key2}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key3}` }, "color": "secondary" }
                            ],
                            [{ "action": { "type": "text", "label": `${key4}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key5}` }, "color": "secondary" },
                                { "action": { "type": "text", "label": `${key6}` }, "color": "secondary" }
                            ],
                            [{ "action": { "type": "text", "label": `${key7}` }, "color": "negative" },
                                { "action": { "type": "text", "label": `${key8}` }, "color": "negative" },
                                { "action": { "type": "text", "label": `${key9}` }, "color": "negative" }
                            ]
                        ]
                    })
                }
            }
            win = true;
        }
        return { 'keybo': keybo, 'win': win };
    },
    updateWidget: function(group) {
        const COLL_NAME = data[group].dataBase,
            token = data[group].widget_token;

        console.log(`Обновляю виджет..`);
        // let time = new Date();

        db().collection(COLL_NAME).find({ "vk": Args.uid }).project({ "fname": 1, "balance": 1 }).toArray((err, res) => {


            const script = {

                title: `📃 Топовые участники`,
                head: [

                    {
                        text: `Имя участника`
                    },

                    {
                        text: '⭐ получено баллов',
                        align: 'right'
                    }
                ],
                more: "Что за баллы?", // текст доп ссылки
                more_url: "https://vk.com/@bots_likes-aktivnost-v-bote-faq-bota", // Дополнительная ссылка
                title_url: "https://vk.com/@bots_likes-aktivnost-v-bote-faq-bota", // Дополнительная ссылка
                body: []
                    //https://vk.com/@bots_likes-aktivnost-v-bote-faq-bota
            };

            res.map((user, i) => {
                script.body.push([{
                        icon_id: `id${user.vk}`,
                        text: `${user.fname}`,
                        url: `vk.com/id${user.vk}`
                    },
                    {
                        text: `${user.balance} 🌟`
                    },
                ]);
            });


            // request.post({
            //     url: 'https://api.vk.me/method/appWidgets.update',
            //     form: {
            //         v: '5.101',
            //         type: 'table',
            //         code: `return ${JSON.stringify(script)};`,
            //         access_token: token
            //     }


            request.post({
                    url: 'https://api.vk.me/method/appWidgets.update',
                    form: {
                        v: '5.101',
                        type: 'text',
                        code: `var [Iuser] = API.users.get({user_id: Args.uid});
                    return {
                    "title": "Куку",
                    "text": "Привет, " + Iuser.first_name,
                    "descr": "Проявляй активность и мы возьмём тебя в ЛТ"
                };`,
                        access_token: token
                    }
                },
                function(err, resp, body) {
                    console.log(body)
                });



        });
    },
    unixStampLeft: (stamp) => {
        stamp = stamp / 1000;

        let s = stamp % 60;
        stamp = (stamp - s) / 60;

        let m = stamp % 60;
        stamp = (stamp - m) / 60;

        let h = (stamp) % 24;
        let d = (stamp - h) / 24;

        let text = ``;

        if (d > 0) text += Math.floor(d) + "д. ";
        if (h > 0) text += Math.floor(h) + "ч. ";
        if (m > 0) text += Math.floor(m) + "мин. ";
        if (s > 0) text += Math.floor(s) + "с.";

        return text;
    },
    getUnix: () => {
        return Date.now();
    },
    getDonateKeybo: function(group) {
        const appId = data[group].donate_app_id,
            groupId = data[group].group_id;

        return keybo = {
            disable_mentions: 1,
            keyboard: JSON.stringify({
                inline: true,
                buttons: [
                    [{ "action": { "type": "open_app", "app_id": appId, "owner_id": -groupId, "label": `ПЕРЕЙТИ 🚀` } }]
                ]
            })
        }
    },
    /**
     * Получить VK для API
     * @param {*} group 
     * @param {*} type 
     * @returns 
     */
    getVk: function(group, type = 'group_token') {
        return new VK({
            token: data[group][type],
            lang: "ru",
            pollingGroupId: data[group].group_id,
            apiMode: "parallel"
        });
    },
    vkId: async function(user_id, group) {
        console.log(group)
        let collection = data[group].dataBase,
            str = user_id,
            vk = this.getVk(group);
        str = str + "";
        return new Promise((r, x) => {
            if (parseInt(str) <= 1000000) {
                db().collection(collection).findOne({
                    vk: parseInt(str)
                }, (error, user) => {
                    if (user) { r(user.vk) } else { r(-1) }
                });
            } else if (parseInt(str) > 1000000) {
                db().collection(collection).findOne({
                    vk: parseInt(str)
                }, (error, user) => {
                    if (user) { r(user.vk) } else { r(-1) }
                });
            } else {
                let link = str.match(/(https?:\/\/)?(m\.)?(vk\.com\/)?([a-z_0-9.]+)/i)
                if (!link) return r(-1)
                vk.api.utils.resolveScreenName({ screen_name: link[4] }).then(s => {
                    r(s.object_id)
                }).catch(h => {
                    r(-1);
                });
            }
        });
    },
    toCommas: function(n) {
        let coins = parseFloat(n.toFixed(3))
        return (coins).toLocaleString().replace(/,/g, ' ').replace(/\./g, ',');
    },
    random: function(min, max) { // Функция для Выбора рандомного числа:
        let rand = min + Math.random() * (max + 1 - min);
        rand = Math.floor(rand);
        return rand;
    },
    chunks: function(array, size) { let results = []; while (array.length) { results.push(array.splice(0, size)); } return results; },
};