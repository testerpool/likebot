let utils = require('../utils');
const data = require('../../config/data.json');
const { Attachment } = require('vk-io');

const price = 20;

module.exports = {
    spin: async function(msg, group) {
        const COLL_NAME = data[group].dataBase,
            vk = utils.getVk(group);

        let smsg = ``;
        let disorder = ["🙄", "😬", "🤐", "🤔", "😧", "😨"];
        let time = msg.user.roulette - Date.now(); // Формула которая считает конец времени VIP

        let keybo_paid = {
            keyboard: JSON.stringify({
                inline: true,
                buttons: [
                    [{ "action": { "type": "text", "label": "Платная рулетка 😎" }, "color": "primary" }]
                ]
            })
        }

        if (time > 1) return msg.send(`❌ Бесплатно крутить рулетку можно раз в 20 часов 💎\n\n
        💦 У [id${msg.user.vk}|Вас] время ещё не прошло \n ⌛ Осталось: ${utils.unixStampLeft(time)}`, keybo_paid);
        let { keybo, win } = await utils.randomRoulette();

        msg.user.roulette = utils.getUnix() + 72000000;

        if (win) {
            smsg += await this.scenarioWinSimpleRoulette(msg, COLL_NAME, vk);
        } else {
            smsg += `Ничего не Выиграли ${disorder[utils.random(0, disorder.length - 1)]} \n Не расстраивайтесь, попробуйте позже ⌛`
        }



        await msg.send(`👇🏻 Рулетка 👇🏻`, keybo);
        return msg.send(`🎰 Вы прокрутили рулетку и \n${smsg}`);
    },


    scenarioWinSimpleRoulette: async function(msg) {
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

    /**
     * Информация о платной рулетке
     * @param {*} msg 
     * @returns string
     */
    info: async function(msg) {
        let smsg = '';
        let keybo = {
            keyboard: JSON.stringify({
                inline: true,
                buttons: [
                    [{ "action": { "type": "text", "label": "ПОПОЛНИТЬ СЧЁТ🌟" }, "color": "positive" }]
                ]
            })
        };

        smsg += '🐾 Вы можете прокрутить рулетку и в случае победы получаете стикеры (за 10 голосов, любые)\n'
        smsg += `💰 Стоимость одного прокрута на данный момент: ${price}₽ \n`
        smsg += `💼 У вас на счету: ${msg.user.rub} ₽ \n\n`

        if (msg.user.rub > price) {

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
    }
}