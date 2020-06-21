const axios = require("axios");
const auth = require("../authentication");
const redis = require("../redis");
const constants = require("../constants");
const util = require("./util");

exports.util = util;

exports.getAccessToken = (requestCode) => {
  return axios({
    url: "https://accounts.spotify.com/api/token",
    method: "post",
    params: {
      grant_type: "authorization_code",
      code: requestCode,
      redirect_uri: constants.REDIRECT_URI,
    },
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth.encodeAuthorizationToBase64()}`,
    },
  });
};

exports.getRefreshToken = async () => {
  try {
    const refreshToken = await redis.getValue("refreshToken");

    const response = await axios({
      url: "https://accounts.spotify.com/api/token",
      method: "post",
      params: {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      },
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth.encodeAuthorizationToBase64()}`,
      },
    });

    console.log("Received refreshed accessToken");

    const newAccessToken = response.data.access_token;

    await redis.setValue("accessToken", newAccessToken);

    return newAccessToken;
  } catch (error) {
    console.log("Error Getting Refreshed Access Token: ", error);
  }
};

exports.createPlaylist = async (data) => {
  const accessToken = await redis.getValue("accessToken");
  return axios({
    url: `https://api.spotify.com/v1/users/${constants.SPOTIFY_USER}/playlists`,
    method: "post",
    headers: {
      Authorization: "Bearer " + accessToken,
    },
    data: {
      public: false,
      collaborative: true,
      ...data,
    },
  });
};

exports.editPlaylist = async (data) => {
  const accessToken = await redis.getValue("accessToken");
  const currentPlaylistId = await redis.getValue("currentPlaylistId");

  return axios({
    url: `https://api.spotify.com/v1/playlists/${currentPlaylistId}`,
    method: "put",
    headers: {
      Authorization: "Bearer " + accessToken,
    },
    data,
  });
};

exports.getPlaylists = async () => {
  const accessToken = await redis.getValue("accessToken");

  return axios({
    url: `https://api.spotify.com/v1/users/${constants.SPOTIFY_USER}/playlists`,
    method: "get",
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  });
};

exports.getPlaylist = async (playlistId) => {
  const accessToken = await redis.getValue("accessToken");

  return axios({
    url: `https://api.spotify.com/v1/playlists/${playlistId}`,
    method: "get",
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  });
};

exports.getCurrentPlaylist = async () => {
  const accessToken = await redis.getValue("accessToken");
  const currentPlaylistId = await redis.getValue("currentPlaylistId");

  return axios({
    url: `https://api.spotify.com/v1/playlists/${currentPlaylistId}`,
    method: "get",
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  });
};

exports.addSongToPlaylist = async (songs) => {
  const accessToken = await redis.getValue("accessToken");
  const currentPlaylistId = await redis.getValue("currentPlaylistId");

  return axios({
    url: `https://api.spotify.com/v1/playlists/${currentPlaylistId}/tracks`,
    method: "post",
    headers: {
      Authorization: "Bearer " + accessToken,
      "Content-Type": "application/json",
    },
    data: {
      uris: songs,
    },
  });
};
