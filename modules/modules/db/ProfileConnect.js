/*jslint esversion: 6, evil: true, loopfunc: true */

const db = require('./MongoConnect');

module.exports = (collection, id, error) => {
    // console.log(`Смотрю пользователя в ${id} в базе данных ${collection}`)

    return new Promise((resolve) => {
        db().collection(collection).findOne({
            vk: id
        }, (error, user) => {
            if (user == null) return resolve({ error: "ERROR BLYAT DEBIL" });
            resolve(new Proxy(user, {
                set(_, key, value) {
                    db().collection(collection).updateOne({
                        vk: id
                    }, {
                        $set: {
                            [key]: value
                        }
                    });
                    return Reflect.set(...arguments);
                }
            }));
        });
    });
};