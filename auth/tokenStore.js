// auth/tokenStore.js
let currentAccessToken = null;

function setAccessToken(token) {
  currentAccessToken = token;
}

function getAccessToken() {
  return currentAccessToken;
}

module.exports = { setAccessToken, getAccessToken };
