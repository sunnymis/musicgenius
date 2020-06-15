const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const port = 4000;
const constants = require('../constants');
const crypto = require('crypto');

app.use(bodyParser.json());

app.listen(port, () => {
  console.log(`Slack Server started. Listening on http://localhost:${port}`)
});

app.post('/', (req, res) => {
  if (!validateSlackRequest(req)) { console.log('validation failed'); return; }

  if (req.body.event && req.body.event.type === 'message') {
    if (req.body.event.text) {
      if (req.body.event.text.includes("https://open.spotify.com/track")) {
        axios({
          url: `${constants.CREATE_PLAYLIST_URL}`,
          method: 'post',
          data: {
            song: req.body.event.text
          }
        })
          .then(resp => console.log('succ resp', resp))
          .catch(err => console.log('err', err));
      }
    }
  }

  res.send(req.body.challenge);
});

const validateSlackRequest = (request) => {
  // https://api.slack.com/authentication/verifying-requests-from-slack
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  const timestamp = request.headers['x-slack-request-timestamp'];
  const requestSignature = request.headers['x-slack-signature'];
  const body = JSON.stringify(request.body);
  const [version, slackHash] = requestSignature.split('=');

  console.log('body?', body);
  const signatureBaseString = `${version}:${timestamp}:${body}`;

  const hash = crypto
    .createHmac('sha256', signingSecret)
    .update(signatureBaseString)
    .digest('hex');


  console.log('hash', hash);
  console.log('slack hash', slackHash);
  console.log('hash ==', hash === slackHash);
  return hash === slackHash;
}
