const spotify = require('../spotify');
const redis = require('../redis');
const get = require('lodash/get');

exports.create = (req, res) => {
  spotify.createPlaylist(req.body)
    .then((response) => {
      console.log('Create Playlist response: ', response.data);
      redis.client.set("currentPlaylistId", response.data.id)
      res.send(response.data.external_urls.spotify);
    })
    .catch((error) => {
      console.log('Create Playlist error: ', error);
      console.log('Create Playlist error: ', error.response);
      res.send('Error creating playlist');
    });
}

exports.edit = async (req, res) => {
  await spotify.getRefreshToken()

  spotify.editPlaylist(req.body)
    .then((response) => {
      console.log('Edit Playlist response: ', response.data);
      res.send('Successfully edited playlist');
    })
    .catch((error) => {
      console.log(req.body);
      const requestData = {
        type: "EDIT",
        body: req.body
      }
      console.log('failed edit');
      console.log('retry request data', requestData);
      handleExpiredAccessToken(error, requestData);
      res.send('Error editing playlist');
    });
}

exports.getCurrent = (req, res) => {
  spotify.getCurrentPlaylist()
    .then((response) => {
      console.log('Getting Current Playlist response: ', response.data)
      res.send(`Successfully retrieved current playlist ${response.data.id}`);
    })
    .catch((error) => {
      console.log('Get Current Playlists error: ', error);
      res.send('Error retrieving current playlist');
    });
}

exports.getAll = async (req, res) => {
  await spotify.getRefreshToken();

  spotify.getPlaylists()
    .then((response) => {
      console.log('Getting Playlists response: ', response.data)
      res.send('Successfully retrieved playlists');
    })
    .catch((err) => {
      handleExpiredAccessToken(err);
      console.log('Get Playlists error: ', err.response.data);
      res.send('Error retrieved playlists');
    });
}

exports.getById = (req, res) => {
  spotify.getPlaylist(req.params.playlistId)
    .then((response) => {
      console.log('Getting Single Playlist response: ', response.data)
      res.send(`Successfully retrieved single playlist ${req.params.playlistId}`);
    })
    .catch((error) => {
      console.log('Get Playlists error: ', error);
      res.send('Error retrieved playlists');
    });
}

exports.add = (req, res) => {
  const song = [spotify.util.getSongURI(req.body.song)];

  spotify.addSongToPlaylist(song)
    .then((response) => {
      console.log('Adding song response: ', response.data)
      res.send(`Successfully added song`);
    })
    .catch((error) => {
      console.log('Adding song error: ', error);
      console.log('Adding song error: ', error.response.data);
      res.send('Error adding song');
    });
}

const handleExpiredAccessToken = (err, requestData) => {
  const error = get(err, 'response.data.error', null);

  if (error) {
    if (error.status === 401 && error.message === 'The access token expired') {
      spotify.getRefreshToken(requestData);
    }
  }
}
