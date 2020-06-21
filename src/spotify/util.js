exports.getSongURI = (uri_or_url) => {
  if (uri_or_url.startsWith("spotify:track:")) {
    return uri_or_url;
  }

  const startDelimiter = "/track/";
  const endDelimiter = "?";
  const startPosition = uri_or_url.indexOf(startDelimiter);
  const endPosition = uri_or_url.indexOf(endDelimiter);
  const offset = startDelimiter.length;

  const trackID = uri_or_url.substring(startPosition + offset, endPosition);

  return `spotify:track:${trackID}`;
};
