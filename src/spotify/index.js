const axios = require('axios');
const auth = require('../authentication');
const redis = require('../redis');
const constants = require('../constants');
const util = require('./util');

exports.util = util;

exports.getAccessToken = (requestCode) => {
  return axios({
    url: 'https://accounts.spotify.com/api/token',
    method: 'post',
    params: {
      grant_type: 'authorization_code',
      code: requestCode,
      redirect_uri: constants.REDIRECT_URI,
    },
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth.encodeAuthorizationToBase64()}`
    },
  });
};

exports.createPlaylist = async () => {
  const accessToken = await redis.getValue("accessToken");

  return axios({
    url: `https://api.spotify.com/v1/users/${constants.SPOTIFY_USER}/playlists`,
    method: 'post',
    headers: {
      'Authorization': 'Bearer ' + accessToken
    },
    data: {
      name: 'my test playlist 3',
      public: false,
      collaborative: true,
      description: 'made from the api 3!'
    },
    // json: true
  });
};

//todo get specific playlist by id
// save id in redis after the create call
exports.getPlaylists = async () => {
  const accessToken = await redis.getValue("accessToken");

  return axios({
    url: `https://api.spotify.com/v1/users/${constants.SPOTIFY_USER}/playlists`,
    method: 'get',
    headers: {
      'Authorization': 'Bearer ' + accessToken
    },
  });
}

exports.getPlaylist = async (playlistId) => {
  const accessToken = await redis.getValue("accessToken");

  return axios({
    url: `https://api.spotify.com/v1/playlists/${playlistId}`,
    method: 'get',
    headers: {
      'Authorization': 'Bearer ' + accessToken
    },
  });
}

exports.getCurrentPlaylist = async () => {
  const accessToken = await redis.getValue("accessToken");
  const currentPlaylistId = await redis.getValue("currentPlaylistId");

  return axios({
    url: `https://api.spotify.com/v1/playlists/${currentPlaylistId}`,
    method: 'get',
    headers: {
      'Authorization': 'Bearer ' + accessToken
    },
  });
}

exports.addSongToPlaylist = async (songs) => {
  const accessToken = await redis.getValue("accessToken");
  const currentPlaylistId = await redis.getValue("currentPlaylistId");

  return axios({
    url: `https://api.spotify.com/v1/playlists/${currentPlaylistId}/tracks`,
    method: 'post',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    data: {
      uris: songs
    },
  });
}
