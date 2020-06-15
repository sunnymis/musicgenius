const BASE_SERVER_URL = 'https://5c431c3ac3b3.ngrok.io'
exports.REDIRECT_URI = `${BASE_SERVER_URL}/authorized`;
exports.CREATE_PLAYLIST_URL = `${BASE_SERVER_URL}/playlists`;
exports.SCOPES = 'user-read-private playlist-modify-private playlist-read-collaborative';
exports.SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
exports.SPOTIFY_USER = process.env.SPOTIFY_USER;
