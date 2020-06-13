const spotify = require('../spotify');
const constants = require('../constants');
const redis = require('../redis');

const {
  REDIRECT_URI,
  SPOTIFY_CLIENT_ID,
  SCOPES
} = constants;

exports.getUrl = (req, res) => {
  url = exports.getAuthorizationUrl();
  res.send(url);
};

exports.authorizationCallback = (req, res) => {
  const requestCode = req.query.code;

  // Request refresh and access tokens
  spotify.getAccessToken(requestCode)
    .then((response) => {
      console.log('printing redis set and get --------------------');

      redis.client.set("accessToken", response.data.access_token, redis.print);
      redis.client.set("expiresIn", response.data.expires_in, redis.print);
      redis.client.set("refreshToken", response.data.refresh_token, redis.print);

      redis.client.get("accessToken", redis.print);
      redis.client.get("expiresIn", redis.print);
      redis.client.get("refreshToken", redis.print);
    })
    .catch((error) => {
      console.log('getAccessToken error:', error);
    })

  res.send('Successfully authenticated with Spotify');
}

exports.encodeAuthorizationToBase64 = () => {
  const stringToEncode = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;

  return Buffer.from(stringToEncode).toString('base64')
}

exports.getAuthorizationUrl = () => {
  const params = {
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    show_dialog: false,
  };

  serialized = serialize(params);

  return `https://accounts.spotify.com/authorize?${serialized}`;
}

const serialize = (obj) => {
  let str = [];
  for (let key in obj)
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]));
    }
  return str.join("&");
}
