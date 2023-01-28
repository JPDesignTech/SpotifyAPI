"use strict";

const express = require("express");
const parser = require("body-parser");
const https = require("yes-https");
const SpotifyAPI = express();

// const { firebase } = require("firebase/app");
// const firestore = require("firebase/firestore");
const firebase = require("firebase-admin");
const logger = require("./modules/logger");
const cors = require("./modules/cors");
const env = process.env.NODE_ENV;
let config;

switch (env) {
  case "production":
    config = require("./modules/config/prod");
    SpotifyAPI.use(https());
    break;

  case "beta":
    config = require("./modules/config/beta");
    break;

  case "development":
    config = require("./modules/config/dev");
    break;

  default:
    config = require("./modules/config/prod");
    SpotifyAPI.use(https());
    break;
}
const port = env == "production" ? process.env.PORT : config.port;

const serviceAccount = require("./private/personalportfolio-4caf3-e397f4744ce4.json");

firebase.initializeApp({
  databaseURL: config.firebase.databaseURL,
  credential: firebase.credential.cert(serviceAccount),
  // credential: firebase.credential.cert(serviceAccount),
  // databaseAuthVariableOverride: { uid: config.firebase.uid }
});

SpotifyAPI.use(parser.json());
SpotifyAPI.use(parser.urlencoded({ extended: false }));
SpotifyAPI.use(cors);

const routes = {
  home: {
    get: require("./routes/home/get"),
  },
  spotify: {
    get: require("./routes/spotify/route"),
  },
};

SpotifyAPI.use("/", routes.home.get);
SpotifyAPI.use("/api/spotify", routes.spotify.get);

SpotifyAPI.listen(port, () => {
  if (env == "production") {
    logger.log(`SpotifyAPI is up in ${env} mode on port ${port}`);
  } else {
    logger.log("info", `SpotifyAPI is up in ${env} mode on port ${port}`);
  }
});
