"use strict";

const express = require("express");
const parser = require("body-parser");
const https = require("yes-https");
const DiscogsAPI = express();

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
    DiscogsAPI.use(https());
    break;

  case "beta":
    config = require("./modules/config/beta");
    break;

  case "development":
    config = require("./modules/config/dev");
    break;

  default:
    config = require("./modules/config/prod");
    DiscogsAPI.use(https());
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

DiscogsAPI.use(parser.json());
DiscogsAPI.use(parser.urlencoded({ extended: false }));
DiscogsAPI.use(cors);

const routes = {
  home: {
    get: require("./routes/home/get"),
  },
  discogs: {
    get: require("./routes/discogs/route"),
    post: require("./routes/discogs/route"),
  },
  notion: {
    vinyls: {
      get: require("./routes/notion/route"),
      post: require("./routes/notion/route"),
    },
  },
};

DiscogsAPI.use("/", routes.home.get);
DiscogsAPI.use("/api/discogs", routes.discogs.get);
DiscogsAPI.use("/api/discogs", routes.discogs.post);
DiscogsAPI.use("/api/vinyls", routes.notion.vinyls.get);
DiscogsAPI.use("/api/vinyls", routes.notion.vinyls.post);

DiscogsAPI.listen(port, () => {
  if (env == "production") {
    logger.log(`PortfolioAPI is up in ${env} mode on port ${port}`);
  } else {
    logger.log("info", `PortfolioAPI is up in ${env} mode on port ${port}`);
  }
});
