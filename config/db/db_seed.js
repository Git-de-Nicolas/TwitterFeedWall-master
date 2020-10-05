// Connexion à la base de donnée

const mongoose = require('mongoose');
const mytweets = require('../../server/models/mytweets');

mongoose.connect('mongodb://localhost:3000/tweets', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error',
    console.error.bind(console,
        'connection error'));

db.once('open', () => {
    // Connecté
    console.log('db connectée sur port 27017');
});
