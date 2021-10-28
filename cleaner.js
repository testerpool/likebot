const { VK, Keyboard, MessageContext } = require('vk-io');
const db = require('./modules/db/MongoConnect');
// внести данные:

const group_token = "f2cde06b98acb3ae78da01403274bcea261d5a97e0df914cf338ee6fac3e02e96ff131fd76d903769c103"; // токен от Kate Mobile или токен группы
const group_id = 189152994; // айди группы
const page_token = ""; // токен страницы с админкой

///////////////////

const vk = new VK({
    token: group_token,
    lang: "ru",
    pollingGroupId: group_id,
    apiMode: "parallel"
});

const page = new VK({ token: page_token });

getDialogs();
async function getDialogs() {
    let conversations = await vk.api.messages.getConversations({ count: 200, offset: 0 });

    // let posts = [];
    // for (let j = 0; j < conversations.count; j++) {
    //     const residue = conversations.count % 100;
    //     const count = conversations.count - residue;
    //     for (let i = 0; i < count; i += 100) {
    //         vk.api.messages.getConversations({
    //             count: 100,
    //             offset: i
    //         }).then(result => {
    //             console.log('зашло сюда');

    //             posts = [...posts, ...result.items];
    //         });
    //     }
    //     vk.api.messages.getConversations({
    //         count: residue,
    //         offset: count
    //     }).then(result => {
    //         console.log('зашло сюда два');
    //         posts = [...posts, ...result.items];
    //     });
    // }

    let offset = 0;

    let $array = [];
    for (let j = 0; j < conversations.count; j++) {

        conversations = await vk.api.messages.getConversations({ count: 200, offset: offset });
        offset += 200;

        for (const item of conversations.items) {
            let peer_id = item.conversation.peer.id;

            let peer_id_db = await db().collection("cleaner").find({ "peer_id": peer_id }).toArray();

            console.log(peer_id_db);
            if (peer_id_db.length == 0) {
                db().collection("cleaner").insertOne({
                    // Информация об игроке:
                    peer_id: peer_id,
                });

                console.log(peer_id);
            }

        }

    }

    console.log($array.length);
}

/**
 * Удалить беседу по ID
 * @param {*} $peer_id - беседы
 * @returns String
 */
async function deleteConversation($peer_id) {
    vk.api.messages.deleteConversation({ peer_id: $peer_id });
    return true;
}

/**
 * Отправить сообщение по peer_id
 */
async function sendMessage($peer_id, $message = 'Приветик, как ты?') {
    vk.api.messages.send({ peer_id: $peer_id, message: $message, random_id: 0 });
    return true;
}