const spotify = require('../spotify');
const redis = require('../redis');
const get = require('lodash/get');

exports.create = async (req, res) => {
  try {
    await spotify.getRefreshToken();

    const response = await spotify.createPlaylist(req.body);
    console.log('Create Playlist response: ', response.data);

    await redis.setValue("currentPlaylistId", response.data.id);

    res.send(response.data.external_urls.spotify);
  } catch (error) {
    console.log('Create Playlist error: ', error);
    res.send('Error creating playlist');
  }
}

exports.editCurrent = async (req, res) => {
  try {
    await spotify.getRefreshToken();

    const response = await spotify.editPlaylist(req.body)
    console.log('Edit Playlist response: ', response.data);

    res.send('Successfully edited playlist');
  } catch (error) {
    console.log('Edit Playlist error: ', error);

    res.send('Error creating playlist');
  }
}

exports.getCurrent = async (req, res) => {
  try {
    await spotify.getRefreshToken();

    const response = await spotify.getCurrentPlaylist();
    console.log('Getting Current Playlist response: ', response.data)

    res.send(`Successfully retrieved current playlist ${response.data.id}`);
  } catch (error) {
    console.log('Get Current Playlists error:', error);

    res.send('Error retrieving current playlist');
  }
}

exports.getAll = async (req, res) => {
  try {
    await spotify.getRefreshToken();

    const response = await spotify.getPlaylists();
    console.log('Getting Playlists response: ', response.data)

    res.send('Successfully retrieved playlists');
  } catch (error) {
    console.log('Get Playlists error: ', error);
    res.send('Error retrieved playlists');
  }
}

exports.getById = async (req, res) => {
  try {
    await spotify.getRefreshToken();

    const response = await spotify.getPlaylist(req.params.playlistId);
    console.log('Getting Single Playlist response: ', response.data)

    res.send(`Successfully retrieved single playlist ${req.params.playlistId}`);
  } catch (error) {
    console.log('Get Playlist By Id error: ', error);
    res.send('Error retrieved playlists');
  }
}

exports.add = async (req, res) => {
  try {
    await spotify.getRefreshToken();

    const song = spotify.util.getSongURI(req.body.song);
    console.log('song to add is', song);

    const response = await spotify.addSongToPlaylist([song]);
    console.log('Adding song response: ', response.data);

    res.send(`Successfully added song`);
  } catch (error) {
    console.log('Adding song error: ', error);
    console.log('Adding song error: ', error.response.data);

    res.send('Error adding song');
  }
}
