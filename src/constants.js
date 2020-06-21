exports.BASE_SERVER_URL = "https://9ae8d51baf66.ngrok.io";
exports.REDIRECT_URI = `${exports.BASE_SERVER_URL}/authorized`;
exports.SCOPES =
  "user-read-private playlist-modify-private playlist-read-collaborative";
exports.SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
exports.SPOTIFY_USER = process.env.SPOTIFY_USER;
