const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const auth = require('./authentication');
const playlists = require('./playlists')

app.use(bodyParser.json());

app.listen(port, () => {
  console.log(`Server started. Listening on http://localhost:${port}`)
});

// Auth
app.get('/', auth.getUrl);
app.get('/authorized', auth.authorizationCallback);

// Playlists
app.post('/create', playlists.create)

app.get('/playlist', playlists.getCurrent)
app.put('/playlist', playlists.editCurrent)
app.post('/playlist', playlists.addSongToCurrent)

app.get('/playlists', playlists.getAll)
app.get('/playlists/:playlistId', playlists.getById)


console.log(auth.getAuthorizationUrl());
