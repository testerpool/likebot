const MongoClient = require('mongodb').MongoClient;

let db; // Переменная которую необходимо вернуть
const URL = "mongodb+srv://igorek:O72hNe0NzyGtsZBD@cluster0.q5fad.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
MongoClient.connect(URL, { // локально: mongodb://localhost:27017
    useNewUrlParser: true,
    authSource: "admin",
    useUnifiedTopology: true
}, function(err, database) {
    if (err) {
        console.error('An error occurred connecting to MongoDB: ', err);
    } else {
        db = database.db(`likebot`);
    }
});

module.exports = function() {
    return db;
};