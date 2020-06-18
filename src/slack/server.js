const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { createEventAdapter } = require('@slack/events-api');
const constants = require('../constants');
const app = express();
const portEvents = 4000;
const portCommands = 5000;

const signingSecret = process.env.SLACK_SIGNING_SECRET;
const slackEvents = createEventAdapter(signingSecret);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

(async () => {
  const server = await slackEvents.start(portEvents);
  console.log(`Listening for events on ${server.address().portEvents}`);
})();

app.listen(portCommands, () => {
  console.log(`Slack Server started. Listening on http://localhost:${portCommands}`)
});


slackEvents.on('message', (event) => {
  if (event.type === 'message') {
    if (event.text && event.text.includes("https://open.spotify.com/track")) {
      axios({
        url: `${constants.ADD_SONG_TO_PLAYLIST_URL}`,
        method: 'post',
        data: {
          song: event.text
        }
      })
        .then(resp => console.log('success resp', resp))
        .catch(err => console.log('err', err));
    }
  }
});


app.post('/command', (req, res) => {
  const { text } = req.body;
  const [name, description] = text.split(',');

  axios({
    url: `${constants.CREATE_PLAYLIST_URL}`,
    method: 'post',
    data: {
      name,
      description,
    }
  })
    .then(resp => {
      console.log('succ resp', resp)

      const responseJSON = JSON.stringify({
        "response_type": "in_channel",
        "text": `Here\'s your playlist!\n ${resp.data}`
      });

      res.setHeader('Content-Type', 'application/json');
      res.send(responseJSON);
    })
    .catch(err => {
      console.log('err', err)

      res.send('Whoops! Something went wrong creating a playlist', err);
    });
});
