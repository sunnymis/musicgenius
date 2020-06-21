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

exports.authorizationCallback = async (req, res) => {
  try {
    const requestCode = req.query.code;
    const response = await spotify.getAccessToken(requestCode);

    redis.client.set("accessToken", response.data.access_token);
    redis.client.set("expiresIn", response.data.expires_in);
    redis.client.set("refreshToken", response.data.refresh_token);

    res.send('Successfully authenticated with Spotify');
  } catch (error) {
    console.log('getAccessToken error:', error);
  };
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
