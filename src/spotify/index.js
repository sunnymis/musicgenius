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

exports.getRefreshToken = async (retryRequestData) => {
  const refreshToken = await redis.getValue("refreshToken");
  console.log('getting refresh token...', refreshToken);

  axios({
    url: 'https://accounts.spotify.com/api/token',
    method: 'post',
    params: {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    },
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth.encodeAuthorizationToBase64()}`
    },
  })
    .then(response => {
      if (retryRequestData) {
        redis.client.set("accessToken", response.data.access_token, retryRequest(retryRequestData));
      } else {
        redis.client.set("accessToken", response.data.access_token, () => {
          console.log('sleeping for 5 seconds');
          setTimeout(() => { }, 5000);
        });
      }

      console.log('new access token', response.data.access_token);
    })
    .catch(error => {
      console.log("Err GRT: ", error);
    });
};

exports.createPlaylist = async (data) => {
  const accessToken = await redis.getValue("accessToken");
  return axios({
    url: `https://api.spotify.com/v1/users/${constants.SPOTIFY_USER}/playlists`,
    method: 'post',
    headers: {
      'Authorization': 'Bearer ' + accessToken
    },
    data: {
      public: false,
      collaborative: true,
      ...data,
    },
  });
};

exports.editPlaylist = async (data) => {
  console.log('in edit playlist');
  const accessToken = await redis.getValue("accessToken");
  const currentPlaylistId = await redis.getValue("currentPlaylistId");

  return axios({
    url: `https://api.spotify.com/v1/playlists/${currentPlaylistId}`,
    method: 'put',
    headers: {
      'Authorization': 'Bearer ' + accessToken
    },
    data,
  });
};

const retryRequest = (requestData) => {
  console.log('retry request');
  if (requestData.type === "EDIT") {
    console.log('retry request EDIT');
    exports.editPlaylist(requestData.body)
      .then(resp => console.log('edit playlist retry', resp))
      .catch(err => console.log('edit playlist retry error', err))
  }
}

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
