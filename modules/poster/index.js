const db = require('../../modules/db/MongoConnect');
const user = require("../../modules/db/ProfileConnect"); // Профили игроков/информация!
const data = require('../../config/data.json');
const utils = require('../utils');

module.exports = {
    /**
     * Публикует пост
     * @param {*} group 
     * @returns 
     */
    poster: async function(group) {
        let group_id = data[group].group_id,
            page = utils.getVk(group, 'page_token');

        let better_id = await this.getBestInBalls(group);

        let photo = await utils.getPhotoWithVkid(better_id, group);
        let target = await user(data[group].dataBase, better_id);
        target.balance = 0;

        let post_id = await page.api.wall.post({
            owner_id: -group_id,
            message: this.generateMessage(),
            attachments: photo,
        }).then(function(a) {
            return a.post_id;
        });
        return this.sendMessageAboutSuccessPublishPost(better_id, post_id, group);
    },
    /**
     * Отправить сообщение в ЛС о публикации поста
     * @param {*} user_id 
     * @param {*} post_id 
     * @param {*} group 
     * @returns 
     */
    sendMessageAboutSuccessPublishPost: function(user_id, post_id, group) {
        const vk = utils.getVk(group),
            group_id = data[group].group_id;
        let smsg = '';

        smsg += 'Приветик ☺ \n Рад сообщить что мы добавили тебя в Like Time и ты уже на стеночке ❤ \n\n';
        smsg += `Ссылочка на пост: \n vk.com/wall-${group_id}_${post_id}`
        return vk.api.messages.send({
            user_id: user_id,
            random_id: 0,
            message: smsg
        });
    },
    /**
     * Получить самого топового по баллам пользователя
     * @param {*} group 
     * @param {*} count 
     * @returns string - ID пользователя
     */
    getBestInBalls: async function(group, count = 5) {
        const vk = utils.getVk(group);
        let people = await db().collection(data[group].dataBase).find({}).sort({ balance: -1 }).limit(count).toArray();

        let peopleWithOpenPages = [];
        for (let man of people) {
            let [IUser] = await vk.api.users.get({ user_ids: man.vk });
            if (IUser.is_closed == true) {
                this.sendMessageAboutClosedPage(IUser.id, group);
            }
            if (IUser.is_closed == false) {
                peopleWithOpenPages.push(IUser.id);
            }
        }

        return peopleWithOpenPages[0];
    },
    /**
     * Отправить сообщение о закрытой странице
     * @param {*} user_id 
     * @param {*} group 
     * @param {*} message 
     * @returns 
     */
    sendMessageAboutClosedPage: function(user_id, group, message = 'У вас достаточно баллов чтобы попасть в ЛТ, но профиль закрыт😬 \n Как же люди будут ставить Вам лайки? \n\n Откройте его) 💞') {
        const vk = utils.getVk(group);
        try {
            vk.api.messages.send({ user_id: user_id, message: message, random_id: 0 });
            return true;
        } catch (error) {
            return error;
        }
    },
    /**
     * Генерирует рандомный текст поста
     * @returns string
     */
    generateMessage: function() {
        return '+9O 💙 и летим дальше 🌠';
        // генерируем сообщение
    },
};