const { VK, Keyboard, MessageContext } = require('vk-io');
const checker = require('../checker/functions');

const vk = new VK({
    token: '7cd9f99e4ddbf231b0edc17395d27aa72361e1cc494ad087a56ce912445084b1675a6bc48e3ef9a547da0',
    lang: "ru",
});

const { updates } = vk;

updates.startPolling();

updates.on('message', async(msg, next) => {
    if (msg.senderId != '-166154096' || msg.isOutbox) return;
    checker.checkDonate('lb');
});