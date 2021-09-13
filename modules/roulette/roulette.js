let utils = require('../utils');

module.exports = {
    spin: async function(msg, COLL_NAME, vk) {
        console.log(msg);

        let smsg = ``;
        let disorder = ["🙄", "😬", "🤐", "🤔", "😧", "😨"];
        let time = msg.user.roulette - Date.now(); // Формула которая считает конец времени VIP



        if (time > 1) return msg.send(`❌ Бесплатно крутить рулетку можно раз в 20 часов 💎\n\n 💦 У [id${msg.user.vk}|Вас] время ещё не прошло \n ⌛ Осталось: ${utils.unixStampLeft(time)}`);
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


    scenarioWinSimpleRoulette: async function(msg, COLL_NAME, vk) {


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
}