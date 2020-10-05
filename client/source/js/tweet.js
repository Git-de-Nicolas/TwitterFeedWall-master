const socket = io();
const cont = document.querySelector('#container');

// Récupération
socket.on('tweet', function (tweet) {
    if (!isReply(tweet.tweet) === true) {
        console.log(tweet);

        let tweetbody = {
            'text': tweet.tweet.text,
            'userScreenName': tweet.tweet.user.screen_name,
            'userImage': tweet.tweet.user.profile_image_url_https,
            'userDescription': tweet.tweet.user.description,
            'id_str': tweet.tweet.id_str
        };

        console.log(tweetbody.text);
        console.log('Tweet ID :' + tweetbody.id_str);

        createtweet(tweetbody); // Lancement de la fonction pour afficher un Tweet
    }

    // ######## Affichage d'un Tweet ##########
    function createtweet(tweetbody) {
        let tweetcont = document.createElement('blockquote');
        tweetcont.classList.add('twitter-tweet');

        let a = document.createElement('a');
        a.href = 'https://twitter.com/' + tweetbody.userScreenName + '/status/' + tweetbody.id_str;

        let script = document.createElement('script');
        script.src = "https://platform.twitter.com/widgets.js";

        tweetcont.appendChild(a);
        tweetcont.appendChild(script);
        cont.appendChild(tweetcont);
    }
});

function isReply(tweet) {
    if (tweet.retweeted_status
        || tweet.in_reply_to_status_id
        || tweet.in_reply_to_status_id_str
        || tweet.in_reply_to_user_id
        || tweet.in_reply_to_user_id_str
        || tweet.in_reply_to_screen_name)
        return true
}
