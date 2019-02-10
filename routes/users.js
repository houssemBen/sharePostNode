var express = require('express');
var router = express.Router();
const client = require('../bin/twitter')
let cache = [];
let cacheAge = 0;

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/user', (req, res) => {
  client.get('account/verify_credentials').then(user => {
    res.send(user)
  }).catch(error => {
    res.send(error);
  });
});

router.get('/home', (req, res) => {
  if (Date.now() - cacheAge > 60000) {
    cacheAge = Date.now();
    const params = { tweet_mode: 'extended', count: 200 };
    if (req.query.since) {
      params.since_id = req.query.since;
    }
    client.get(`statuses/home_timeline`, params)
      .then(timeline => {
        cache = timeline;
        res.send(timeline);
      })
      .catch(error => res.send(error));
  } else {
    res.send(cache);
  }
});

router.post('/favorite/:id', (req, res) => {
  const path = (req.body.state) ? 'create' : 'destroy';
  client.post(`favorites/${path}`, { id: req.params.id })
    .then(tweet => res.send(tweet))
    .catch(error => res.send(error));
});

router.post('/retweet/:id', (req, res) => {
  const path = (req.body.state) ? 'retweet' : 'unretweet';
  client.post(`statuses/retweet/${req.params.id}`)
    .then(tweet => res.send(tweet))
    .catch(error => res.send(error));
});

router.post('/tweet', (req, res) => {
  const body = req.body
  client.post(`statuses/update`,{status:req.body.status})
    .then(tweet => res.send(tweet))
    .catch(error => res.send(error));
});
module.exports = router;
