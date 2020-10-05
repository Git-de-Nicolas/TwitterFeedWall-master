const Twit = require('twit');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const Sensor = require('./server/models/sensors.js');
const mongoose = require('mongoose');

// Identifiants Twitter
let Tweet = new Twit({
    consumer_key: '',
    consumer_secret: '',
    access_token: '',
    access_token_secret: ''
});

mongoose.connect('mongodb://localhost:27017/capteurs', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use('/source', express.static(__dirname + '/client/source/'));

//- Routes
app.get('/', (req, res) => { // HOME
    res.sendFile(__dirname + "/client/index.html");
});

app.get('/tweets', (req, res) => { // MUR DE TWEETS
    res.sendFile(__dirname + "/client/tweets.html");
});

app.get('/dataviz', (req, res) => { // GRAPHIQUE
    res.sendFile(__dirname + '/client/dataviz.html');
});

app.get('/api/capteurs/:stype', function (req, res) {

    Sensor.find({"sensor_type": req.params.stype}).exec(function (err, sensorList) {
        if (err) {
            console.log(err);
        }
        console.log(sensorList);
        res.json(sensorList);
    });
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
                    var str = tweet.text.split(" ");
                    str.forEach(function (word) {
                        if (word.charAt(0) !== '#') {

                            var newObj = {
                                name: "Température Sensor",
                                sensor_type: 'Temp',
                                value: word,
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
                if (hash.text === 'hum') {
                    var str = tweet.text.split(" ");
                    str.forEach(function (word) {
                        if (word.charAt(0) !== '#') {
                            var newObj = {
                                name: "Humidity Sensor",
                                sensor_type: 'Hum',
                                value: word,
                            }
                            const toCreate = new Sensor(newObj);

                            toCreate.save().then(function (newValue) {
                                io.emit('humChange', {
                                    'newHum': word
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


stream.on('error', function (error) {
    throw error;
});

//- Serveur :
server.listen(3000, () => {
    console.log("C'est prêt ici : -> http://localhost:3000")
});
