const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { createEventAdapter } = require('@slack/events-api');
const app = express();
const port = 4000;
const port2 = 5000;
const constants = require('../constants');

const signingSecret = process.env.SLACK_SIGNING_SECRET;
const slackEvents = createEventAdapter(signingSecret);

(async () => {
  // Start the built-in server
  const server = await slackEvents.start(port);
  // Log a message when the server is ready
  console.log(`Listening for events on ${server.address().port}`);
})();

slackEvents.on('message', (event) => {
  console.log('Event', event);
  if (event.type === 'message') {
    if (event.text && event.text.includes("https://open.spotify.com/track")) {
      axios({
        url: `${constants.ADD_SONG_TO_PLAYLIST_URL}`,
        method: 'post',
        data: {
          song: event.text
        }
      })
        .then(resp => console.log('succ resp', resp))
        .catch(err => console.log('err', err));
    }
  }
  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
});

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.listen(port2, () => {
  console.log(`Slack Server started. Listening on http://localhost:${port2}`)
});

app.post('/command', (req, res) => {
  // todo make checks for team domain and channel name  in req.body
  const { text } = req.body;

  const [name, description] = text.split(',');

  console.log('name description', name, description);
  console.log('url', constants.CREATE_PLAYLIST_URL);
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
