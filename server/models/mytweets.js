const mongoose = require('mongoose');

let mytweets = mongoose.Schema({
    username: String,
    profile_img: String,
    text: String,
    hashtag: String,
    date: String,
    geolocalisation: String
});

const mytweets = mongoose.model('mytweets', mytweets);

module.exports = mytweets;
