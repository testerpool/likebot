const request = require('request');

const db = require("../db/MongoConnect"); // Подключение к БАЗЕ ДАННЫХ!
const user = require("../db/ProfileConnect"); // Профили игроков/информация!
const utils = require("../utils");
const data = require("../../config/data.json");
const groups = [165367966, 164711863, 189152994]

/*-------------------------------------------------------------------*/
/*     |                       
/*     |                      Функции      
/*     V                        
/*-------------------------------------------------------------------*/
module.exports = {
    checkDonate: function(group) {
        const key = data[group].donate_app_token,
            COLL_NAME = data[group].dataBase,
            page = utils.getVk(group, 'page_token'),
            vk = utils.getVk(group);


        console.log(key);
        let link = 'https://api.vkdonate.ru/?action=donates&count=5&key=' + key;
        request(link, async function(error, response, body) {
            if (error) return console.log(error)

            let answer = JSON.parse(body); // answer
            const { donates } = answer;

            // полученные данные с доната:
            const uid = Number(donates[0].uid);
            const sum = Number(donates[0].sum);
            const message = donates[0].msg;
            const date = donates[0].date;

            let NewUser = await db().collection(COLL_NAME).findOne({ vk: uid });
            if (!NewUser) NewUser = await utils.regDataBase(uid, group);

            // прекращаем обрабатывать донат, если уже обработали ранее
            if (NewUser.lastDonate == date) return console.log(`RETURN`);

            // получаем фото профиля:
            let photo = await utils.getPhotoWithVkid(uid, group);

            // если сообщение есть:
            if (message) {
                let photoId = message.match(/(photo\d+_\d+)/i);
                if (photoId != null) {
                    photo = photoId[0].match(/(\d+_\d+)/i);
                    photo = photo[0];
                }
            }

            utils.setPhoto(photo, sum, Math.ceil(sum / 10), groups);

            let t = await user(COLL_NAME, uid);
            // регистрируем в базе данных как "обработано"
            t.lastDonate = date;
            t.rub += sum;

            // проверка суммы доната:
            if (sum <= 10) {
                // калькулятор баллов:
                let ball = Number(sum * 30);
                t.balance += ball;

                groups.forEach(group_id => {
                    utils.sendToQueue(photo, group_id, 1, 1);
                });


                if (t.alert) await vk.api.messages.send({
                    user_id: t.vk,
                    random_id: 0,
                    message: `💌 Приветствую! Благодарим за донат 💰\n\n 🔥 Выдаём Вам баллы 🔥 \n\n 👉🏻 Вы пополнили счёт на ${sum} рублей, в баллах это получилось: ${ball} 🌟`,
                    keyboard: JSON.stringify({
                        inline: true,
                        buttons: [
                            [{ "action": { "type": "text", "label": "Уведомления 🔕" }, "color": "negative" }]
                        ]
                    })
                }).catch((error) => { console.log(`Ошибка при отправке сообщения: ${error}`) });
            }

            // первый на стене (добавляем в очередь):
            if (sum > 10 && sum <= 20) {

                // добавляем пользователя в очередь
                groups.forEach(group_id => {
                    utils.sendToQueue(photo, group_id, 0, 1);
                });

                if (t.alert) await vk.api.messages.send({
                    user_id: t.vk,
                    random_id: 0,
                    message: `💌 Приветствую! Благодарим за донат 💰\n 🍒 Добавили в очередь фото которое вы указали в сообщении, в самый верх, во всех группах \n♻ (ссылки на них есть в блоке "Ссылки" на главной странице) \n\n 🥳 ПОДАРКИ: \n1️⃣ Мы добавим твою фотку в САМЫЙ вверх команды "ОБМЕН 💙" на сумму доната, и сортировать будем по ней \n2️⃣ Добавим твою фотку в наши СЕКРЕТНЫЕ группы-партнёры \n💌 Сделаем тебе как можно больше лайков 🍓`,
                    keyboard: JSON.stringify({
                        inline: true,
                        buttons: [
                            [{ "action": { "type": "text", "label": "Уведомления 🔕" }, "color": "negative" }],
                            [{ "action": { "type": "text", "label": "👤 Очередь" }, "color": "positive" }],
                        ]
                    })
                }).catch((error) => { console.log(`Ошибка при отправке сообщения: ${error}`) });
            }

            // лт без очереди, отдельно, с быстрой публикацией поста:
            if (sum > 20 && sum <= 30) {
                // добавляем пользователя в очередь
                groups.forEach(group => {
                    utils.postPublication(photo, group);
                });

                if (t.alert) await vk.api.messages.send({
                    user_id: t.vk,
                    random_id: 0,
                    message: `💌 Приветствую! Благодарим за донат 💰\n👉🏻 Выложили пост с фото уже на стенах во всех группах 🚀\n♻ (ссылки на них есть в блоке "Ссылки" на главной странице) \n\n 🥳 ПОДАРКИ: \n1️⃣ Мы добавим твою фотку в САМЫЙ вверх команды "ОБМЕН 💙" на сумму доната, и сортировать будем по ней \n2️⃣ Добавим твою фотку в наши СЕКРЕТНЫЕ группы-партнёры \n💌 Сделаем тебе как можно больше лайков 🍓`,
                    keyboard: JSON.stringify({
                        inline: true,
                        buttons: [
                            [{ "action": { "type": "text", "label": "Уведомления 🔕" }, "color": "negative" }],
                        ]
                    })
                }).catch((error) => { console.log(`Ошибка при отправке сообщения: ${error}`) });
            }

            if (sum > 30) {
                // добавляем пользователя в очередь
                groups.forEach(group => {
                    utils.postPublication('photo' + photo, group);
                });

                if (t.alert) await vk.api.messages.send({
                    user_id: t.vk,
                    random_id: 0,
                    message: `💌 Приветствую! Благодарим за донат 💰\n Закрепим в течении часа, если есть свободное место 🚀 \n👉🏻 Выложили пост с фото уже на стенах во всех группах 🚀\n♻ (ссылки на них есть в блоке "Ссылки" на главной странице) \n\n 🥳 ПОДАРКИ: \n1️⃣ Мы добавим твою фотку в САМЫЙ вверх команды "ОБМЕН 💙" на сумму доната, и сортировать будем по ней \n2️⃣ Добавим твою фотку в наши СЕКРЕТНЫЕ группы-партнёры \n💌 Сделаем тебе как можно больше лайков 🍓`,
                    keyboard: JSON.stringify({
                        inline: true,
                        buttons: [
                            [{ "action": { "type": "text", "label": "Уведомления 🔕" }, "color": "negative" }],
                        ]
                    })
                }).catch((error) => { console.log(`Ошибка при отправке сообщения: ${error}`) });
            }
        })
    }
}