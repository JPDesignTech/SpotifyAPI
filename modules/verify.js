'use strict';

const logger = require('./logger');
const firebase = require('firebase-admin');

const verify = async (req, res, next) => {
  if (req.body.idToken || req.header('idToken')) {
    let idToken = req.body.idToken || req.header('idToken');

    // auth with token
    await firebase
      .auth()
      .verifyIdToken(idToken)
      .then(decodedToken => {
        req.body.decodedToken = decodedToken;
        next();
      })
      .catch(error => {
        
        logger.log( 'failed to decode idToken - ' + error);
        res.send({
          message: 'failed to decode idToken',
          error: error.toString()
        });
      });
  } else {
    logger.log( 'failed to include idToken');
    res.send({ message: 'failed to include idToken' });
  }
};

module.exports = verify;
