'use strict';

const SaveTrafic = require("./lib/SaveTrafic")
const MyToken = require("./lib/MyToken")

module.exports.MyToken = MyToken
module.exports.SaveTrafic = SaveTrafic
module.exports.contracts = [SaveTrafic, MyToken]