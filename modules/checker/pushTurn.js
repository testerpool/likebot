var cron = require('node-cron');
const db = require("../db/MongoConnect"); // Подключение к БАЗЕ ДАННЫХ!
const { random } = require("../utils");
const utils = require("../utils");
const groups = [165367966, 164711863, 109847065, 33879877, 52695815, 51318460, 61379580, 168009141, 133171419, 165790945, 173987637];

async function test() {
    console.log('work')
}

Array.prototype.diff = function(a) {
    return this.filter(function(i) { return a.indexOf(i) < 0; });
};

async function pushTurn() {
    let users = await db().collection("photo").find({ "additions": { $gte: 1 } }).sort({ 'donate': -1 }).toArray(); // получаем людей с положительным числом дней

    users.forEach(user => {

        // инициализация переменных:
        let userGroups = user.groups; // группы пользователя (из БД)
        let additions = user.additions; // количество добавлений
        let uniqGroup = groups.diff(userGroups); // уникальные группы, массив
        let group = uniqGroup[random(0, uniqGroup.length - 1)]; // одна уникальная рандомная группа
        let photo = `photo${user.vk}_${user.photo}`; // фото

        // обновляем переменные:
        userGroups.push(group);
        additions = additions - 1;

        // обновляем БД
        db().collection("photo").updateOne({
            vk: user.vk
        }, {
            $set: {
                additions: additions,
                groups: userGroups,
            }
        })

        // отправляем в очередь
        utils.sendToQueue(photo, group)
    });
}

setTimeout(() => {
    test();
    // pushTurn();
}, 5000);

cron.schedule('0 */4 * * *', () => {
    pushTurn();
});