'use strict';

const winston = require('winston');
const { LoggingWinston } = require("@google-cloud/logging-winston");
const env = process.env.NODE_ENV;
let config;

switch (env) {
  case "production":
    config = require("./config/prod");
    break;

  case "beta":
    config = require("./config/beta");
    break;

  case "development":
    config = require("./config/dev");
    break;

  default:
    config = require("./config/prod");
    break;
}

const loggingWinston = new LoggingWinston();

let logger;

if (env == "production") {
  logger = new winston.Logger({
    level: "info",
    transports: [new winston.transports.Console(), loggingWinston],
  });
} else {
  logger = new winston.Logger({
    transports: [
      new winston.transports.Console(),
      new winston.transports.File(config.winston.info),
      new winston.transports.File(config.winston.error),
    ],
  });
}





module.exports = logger;