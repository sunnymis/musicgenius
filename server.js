const axios = require('axios');
const express = require('express');
const redis = require('redis');
const { promisify } = require("util");

const app = express();
const port = 3000;
const redirectUri = 'http://70f2b73ec287.ngrok.io/authorized';
const redisClient = redis.createClient();
const getAsync = promisify(redisClient.get).bind(redisClient);
const SPOTIFY_USER = process.env.SPOTIFY_USER;

app.listen(port, () => console.log(`Server started. Listening on http://localhost:${port}`));

// This will return a URL to a Spotify page where you can authorize your account
app.get('/', (req, res) => {
  url = getAuthorizationUrl();
  res.send(url);
});

// Callback redirect endpoint called when you agree to authorizing your spotify account
// This returns a code that will be used to get the Access Token
app.get('/authorized', (req, res) => {
  let requestCode = req.query.code;

  // Request refresh and access tokens
  getAccessToken(requestCode)
    .then((response) => {
      console.log('printing redis set and get --------------------');

      redisClient.set("accessToken", response.data.access_token, redis.print);
      redisClient.set("expiresIn", response.data.expires_in, redis.print);
      redisClient.set("refreshToken", response.data.refresh_token, redis.print);

      redisClient.get("accessToken", redis.print);
      redisClient.get("expiresIn", redis.print);
      redisClient.get("refreshToken", redis.print);
    })
    .catch((error) => {
      console.log('getAccessToken error:', error);
    })

  res.send('Successfully authenticated with Spotify');
});

// Endpoint to create a playlist
app.post('/create', (req, res) => {
  createPlaylist()
    .then((response) => {
      console.log('Create Playlist response: ', response);
      res.send('Successfully created playlist'); // todo return playlist id
    })
    .catch((error) => {
      console.log('Create Playlist error: ', error.response.data);
      res.send('Error creating playlist');
    });
});

app.get('/playlists', (req, res) => {
  getPlaylists()
    .then((response) => {
      console.log('Getting Playlists response: ', response.data)
      res.send('Successfully retrieved playlists');
    })
    .catch((error) => {
      console.log('Get Playlists error: ', error);
      res.send('Error retrieved playlists');
    });
});

const getAuthorizationUrl = () => {
  const serialize = (obj) => {
    let str = [];
    for (let key in obj)
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]));
      }
    return str.join("&");
  }

  const params = {
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: 'user-read-private playlist-modify-private playlist-read-collaborative',
    show_dialog: false,
  };

  serialized = serialize(params);

  return `https://accounts.spotify.com/authorize?${serialized}`;
}




const getAccessToken = (requestCode) => {
  return axios({
    url: 'https://accounts.spotify.com/api/token',
    method: 'post',
    params: {
      grant_type: 'authorization_code',
      code: requestCode,
      redirect_uri: redirectUri,
    },
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${encodeAuthorizationToBase64()}`
    },
  });
};

const createPlaylist = async () => {
  const accessToken = await getValueFromRedis("accessToken");

  return axios({
    url: `https://api.spotify.com/v1/users/${SPOTIFY_USER}/playlists`,
    method: 'post',
    headers: {
      'Authorization': 'Bearer ' + accessToken
    },
    data: {
      name: 'my test playlist',
      public: false,
      collaborative: true,
      description: 'made from the api!'
    },
    // json: true
  });
};

//todo get specific playlist by id
// save id in redis after the create call
const getPlaylists = async () => {
  const accessToken = await getValueFromRedis("accessToken");
  return axios({
    url: `https://api.spotify.com/v1/users/${SPOTIFY_USER}/playlists`,
    method: 'get',
    headers: {
      'Authorization': 'Bearer ' + accessToken
    },
  });
}

const addSong = async (songId) => {
  const accessToken = await getValueFromRedis("accessToken");

  return axios({
    url: `https://api.spotify.com/v1/users/${SPOTIFY_USER}/playlists`,
    method: 'post',
    headers: {
      'Authorization': 'Bearer ' + accessToken
    },
    data: {
      name: 'my test playlist',
      public: false,
      collaborative: true,
      description: 'made from the api!'
    },
  });
}


console.log(getAuthorizationUrl());

const getValueFromRedis = async (key) => {
  const accessToken = await getAsync(key);

  return accessToken;
}

const encodeAuthorizationToBase64 = () => {
  const stringToEncode = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;

  return Buffer.from(stringToEncode).toString('base64')
}
