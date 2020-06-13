const spotify = require('../spotify');
const redis = require('../redis');

exports.create = (req, res) => {
  spotify.createPlaylist()
    .then((response) => {
      console.log('Create Playlist response: ', response.data);
      redis.client.set("currentPlaylistId", response.data.id)
      res.send('Successfully created playlist'); // todo return playlist id
    })
    .catch((error) => {
      console.log('Create Playlist error: ', error);
      console.log('Create Playlist error: ', error.response);
      res.send('Error creating playlist');
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

exports.getAll = (req, res) => {
  spotify.getPlaylists()
    .then((response) => {
      console.log('Getting Playlists response: ', response.data)
      res.send('Successfully retrieved playlists');
    })
    .catch((error) => {
      console.log('Get Playlists error: ', error);
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
