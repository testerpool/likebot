let utils = require('../utils');
const data = require('../../config/data.json');
const prices = require('./price.json');

let donate_keybo = {
    keyboard: JSON.stringify({
        inline: true,
        buttons: [
            [{ "action": { "type": "text", "label": "ПОПОЛНИТЬ СЧЁТ🌟" }, "color": "positive" }]
        ]
    })
};

module.exports = {
    menu: function(msg) {
        let keybo = this.getMenu(msg);
        return msg.send('Вы перешли в режим рулетки 🎰', keybo);
    },
    freeSpin: async function(msg) {
        let smsg = ``;
        let disorder = ["🙄", "😬", "🤐", "🤔", "😧", "😨"];
        let time = msg.user.roulette - Date.now();


        if (time > 1) return msg.send(`❌ Бесплатно крутить рулетку можно раз в 8 часов 💎\n\n
        💦 У [id${msg.user.vk}|Вас] время ещё не прошло \n ⌛ Осталось: ${utils.unixStampLeft(time)}`);
        let { keybo, win } = await utils.randomRoulette();

        msg.user.roulette = utils.getUnix() + 28800000;

        if (win) {
            smsg += await this.scenarioWinFreeRoulette(msg);
        } else {
            smsg += `Ничего не Выиграли ${disorder[utils.random(0, disorder.length - 1)]} \n Не расстраивайтесь, попробуйте позже ⌛`
        }


        let menu = this.getMenu(msg);

        await msg.send(`👇🏻 Рулетка 👇🏻`, keybo);
        return msg.send(`🎰 Вы прокрутили рулетку и \n${smsg}`, menu);
    },

    scenarioWinFreeRoulette: async function(msg) {
        let smile = ["🙀", "😻", "😎", "😱", "😳", "🤑", "🤩"];
        let smsg = '';
        // Рандомайзер
        let rand = utils.random(1, 100)
        let rand_rub = utils.random(1, 3);
        let rand_ball = utils.random(3, 20);

        smsg += `Сорвали ДЖЕКПОТ ${smile[utils.random(0, smile.length - 1)]} \n`;
        if (rand <= 90) {
            smsg += `+ ${rand_ball} баллов 🌟`
            msg.user.balance += parseFloat(rand_ball);
            msg.user.points += parseFloat(rand_ball);
        }
        if (rand > 90) {
            smsg += `+ ${rand_rub} рублей ₽`
            msg.user.rub += parseFloat(rand_rub);
        }

        return smsg;
    },

    scenarioWinForFiveVotes: async function(msg) {
        let smile = ["🙀", "😻", "😎", "😱", "😳", "🤑", "🤩"];
        let smsg = '';
        // Рандомайзер

        smsg += `👉🏻 ПОБЕДИЛИ ${smile[utils.random(0, smile.length - 1)]} \n`;

        smsg += `Выбирайте любой стикер за 5 голосов и сообщите нам его название 🐯\n`;

        smsg += 'Мы ждём Вашего ответа в репорт 🆘\n';

        this.sendMessageAboutWinner(msg, 'five');

        return smsg;
    },

    scenarioWinForTenVotes: async function(msg) {
        let smile = ["🙀", "😻", "😎", "😱", "😳", "🤑", "🤩"];
        let smsg = '';
        // Рандомайзер

        smsg += `👉🏻 ПОБЕДИЛИ ${smile[utils.random(0, smile.length - 1)]} \n`;

        smsg += '🎁 Сейчас мы пришлем Вам подарочек - ЗОЛОТУЮ КОРОБКУ СО СТИКЕРАМИ 📦\n';

        this.sendMessageAboutWinner(msg, 'ten');

        return smsg;
    },

    scenarioLossForRubles: async function(msg) {
        let smile = ["🙀", "😻", "😎", "😱", "😳", "🤑", "🤩"];
        let smsg = '';
        // Рандомайзер
        let rand = utils.random(1, 100)
        let rand_rub = utils.random(1, 5);
        let rand_ball = utils.random(30, 200);

        smsg += `👉🏻 К сожалению стикеры вы не выиграли, но без подарка вы не останетесь ${smile[utils.random(0, smile.length - 1)]} \n`;
        smsg += '🎁 Мы дарим Вам \n\n'
        if (rand <= 90) {
            smsg += `+ ${rand_ball} баллов 🌟`
            msg.user.balance += parseFloat(rand_ball);
            msg.user.points += parseFloat(rand_ball);
        }
        if (rand > 90) {
            smsg += `+ ${rand_rub} рублей ₽`
            msg.user.rub += parseFloat(rand_rub);
        }

        return smsg;
    },

    /**
     * Информация о платной рулетке
     * @param {*} msg 
     * @returns string
     */
    info: async function(msg) {
        let smsg = '';

        let keybo = donate_keybo;

        smsg += '🐾 Вы можете прокрутить рулетку и в случае победы получаете стикеры (за 10 голосов, любые)\n'
        smsg += `💰 Стоимость одного прокрута на данный момент: ${price}₽ \n`
        smsg += `💼 У вас на счету: ${msg.user.rub} ₽ \n\n`

        if (msg.user.rub >= price) {

            smsg += `Нажимая кнопку "Крутить рулетку 🎰" вы соглашаетесь с условиями акции`

            keybo = {
                keyboard: JSON.stringify({
                    inline: true,
                    buttons: [
                        [{ "action": { "type": "text", "label": "Крутить рулетку 🎰" }, "color": "positive" }]
                    ]
                })
            }
        }

        await msg.send(`🐯 Рулетка на стикеры: \n\n ${smsg}`, { attachment: 'photo-165367966_457251669' });
        return msg.send('💦', keybo);
    },

    spinCaseForFiveVotes: async function(msg) {
        let smsg = ``;

        let price = prices['five'];
        if (msg.user.rub < price) return msg.send('У вас нет рублей на балансе, пополните счёт и подождите некоторое время 🔥', donate_keybo)

        msg.user.rub -= price;

        let { keybo, win } = await utils.randomRoulette();

        let menu = this.getMenu(msg);

        if (win) {
            menu = {
                keyboard: JSON.stringify({
                    inline: false,
                    buttons: [
                        [{ "action": { "type": "text", "label": "🆘 Репорт" }, "color": "negative" }],
                        [{ "action": { "type": "text", "label": "Назад 🔙" }, "color": "secondary" }]
                    ]
                })
            };

            smsg += await this.scenarioWinForFiveVotes(msg);
        } else {
            smsg += await this.scenarioLossForRubles(msg);
        }

        await msg.send(`👇🏻 Рулетка 👇🏻`, keybo);
        return msg.send(`🎰 Вы прокрутили рулетку на СТИКЕРЫ и \n${smsg}`, menu);
    },

    spinCaseForTenVotes: async function(msg) {
        let smsg = ``;

        let price = prices['ten'];

        if (msg.user.rub < price) return msg.send('У вас нет рублей на балансе, пополните счёт и подождите некоторое время 🔥', donate_keybo)

        msg.user.rub -= price;

        let { keybo, win } = await utils.randomRoulette();

        let menu = this.getMenu(msg);

        if (win) {
            smsg += await this.scenarioWinForTenVotes(msg);
        } else {
            smsg += await this.scenarioLossForRubles(msg);
        }

        await msg.send(`👇🏻 Рулетка 👇🏻`, keybo);
        return msg.send(`🎰 Вы прокрутили рулетку на СТИКЕРЫ и \n${smsg}`, menu);
    },

    /**
     * Получить клавиатуру меню
     * @param {*} msg 
     * @returns 
     */
    getMenu: function(msg) {
        let time = msg.user.roulette - Date.now(),
            priceForFiveVotes = prices['five'],
            priceForTenVotes = prices['ten'];


        let free = { "action": { "type": "text", "label": "БЕСПЛАТНАЯ 🆓" }, "color": "positive" },
            keyboFiveVotes = { "action": { "type": "text", "label": "СТИКЕРЫ ЗА 5 ГOЛOСOВ 🐾" }, "color": "primary" },
            keyboTenVotes = { "action": { "type": "text", "label": "СТИКЕРЫ ЗА 1O ГOЛOСOВ 🐯" }, "color": "primary" };

        if (time > 1) {
            free = { "action": { "type": "text", "label": "бесплатная ❎" }, "color": "negative" };
        }

        if (msg.user.rub >= priceForFiveVotes) {
            keyboFiveVotes = { "action": { "type": "text", "label": "СТИКЕРЫ ЗА 5 ГOЛOСOВ 🐾" }, "color": "positive" };
        }

        if (msg.user.rub >= priceForTenVotes) {
            keyboTenVotes = { "action": { "type": "text", "label": "СТИКЕРЫ ЗА 1O ГOЛOСOВ 🐯" }, "color": "positive" };
        }

        return {
            keyboard: JSON.stringify({
                inline: false,
                buttons: [
                    [free],
                    [keyboFiveVotes],
                    [keyboTenVotes],

                    [{ "action": { "type": "text", "label": "Назад 🔙" }, "color": "secondary" }]
                ]
            })
        };
    },

    sendMessageAboutWinner: function(msg, type) {
        let vk = utils.getVk('lb');

        if (type == 'five') {
            vk.api.messages.send({
                chat_id: 14,
                random_id: 0,
                message: `🎰 @id${msg.user.vk} прокрутил рулетку на 5 голосов и победил ✅`,
            });
        }

        if (type == 'ten') {
            vk.api.messages.send({
                chat_id: 14,
                random_id: 0,
                message: `🎰 @id${msg.user.vk} прокрутил рулетку на 1O голосов и победил ✅ \n Золотая коробочка 📦`,
            });
        }

    }
}