// index.js == server.js

const Twit = require('twit');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const Sensor = require('./server/models/sensors.js');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/capteurs', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use('/source', express.static(__dirname + '/client/source/'));

// Identifiants Twitter
let Tweet = new Twit({
    consumer_key: 'ctxEnpYHuvYJlWmrZxrKto767',
    consumer_secret: 'MeAFPHnUMRZFHpLG82pZzjIj4s7wq6zCEwlC0V36XiM7fNHBUR',
    access_token: '1300423028774494208-tXXUnTGHS5WDf8DTjkhNCM28ul9que',
    access_token_secret: 'bMrCwSsxceoDsYgyzLkRntAIuBoPj8ftPaCCi3cSw6VgY'
});

//- Paramètres de recherche : "javascript" et "iot"
let stream = Tweet.stream('statuses/filter', {
    track: ['#javascript, #iot']
});

//- Ecoute le stream socket.io
stream.on('tweet', (tweet) => {
    io.emit('tweet', {'tweet': tweet});

    if (tweet.user.id_str == '1313122241773699072') {
        console.log('mon compte twitter');
        console.log(tweet.place.boundin_box.coordinates);
        console.log(tweet.entities.hashtags);
        if (tweet.entities.hashtags.length > 0) {
            tweet.entities.hashtags.forEach(function (hash) {
                if (hash.text === 'color') {
                    let str = tweet.text.split(" ");
                    str.forEach(function (word) {
                        if (word.charAt(0) !== '#') {
                            io.emit('colorChange', {
                                'newcolor': word
                            });
                        }
                    })
                }
                if (hash.text === 'temp') {
                    let str = tweet.text.split(" ");
                    str.forEach(function (word) {
                        if (word.charAt(0) !== '#') {
                            let newObj = {
                                name: "Température Sensor",
                                sensor_type: 'Temp',
                                value: word
                            }
                            const toCreate = new Sensor(newObj);

                            toCreate.save().then(function (newValue) {
                                io.emit('tempChange', {
                                    'newTemp': word
                                });
                                console.log(newValue);
                            });
                        }
                    })
                }
            })
        }
    }
});

//- Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/client/index.html");
});

app.get('/tweets', (req, res) => {
    res.sendFile(__dirname + "/client/tweets.html");
});

app.get('/dataviz', (req, res) => {
    res.sendFile((__dirname + '/client/dataviz.html'));
});

app.get('/api/sensors/:stype', function (req, res) {

    Sensor.find({"sensor_type": req.params.stype}).exec(function (err, sensorList) {
        if (err) {
            console.log(err);
        }
        console.log(sensorList);
        res.json(sensorList);
    });
});

//- Serveur :
server.listen(3000, () => {
    console.log("C'est prêt ici : -> http://localhost:3000")
});
