const redis = require('redis');
const { promisify } = require("util");

const client = redis.createClient();

const getAsync = promisify(client.get).bind(client);

const getValue = async (key) => {
  const value = await getAsync(key);

  return value;
}


module.exports = {
  client,
  getValue,
  print: redis.print,
}
