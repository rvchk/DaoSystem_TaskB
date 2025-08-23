'use strict';

const SaveTrafic = require("./lib/SaveTrafic")
const Startup = require("./lib/DaoSystem")

module.exports.SaveTrafic = SaveTrafic
module.exports.Startup = SaveTrafic
module.exports.contracts = [SaveTrafic, Startup]