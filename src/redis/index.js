const redis = require('redis');
const { promisify } = require("util");

const client = redis.createClient();

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

const getValue = async (key) => {
  const value = await getAsync(key);

  return value;
}

const setValue = async (key, value) => {
  return await setAsync(key, value);
};


module.exports = {
  client,
  getValue,
  setValue,
  print: redis.print,
}
