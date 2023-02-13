const provider = require("./provider.js");

module.exports = {
  activate: () => provider.load(),
  getProvider: () => provider,
};
