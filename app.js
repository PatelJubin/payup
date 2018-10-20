// jshint esversion: 6

// Imports
const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const cookie = require('cookie');
const crypto = require('crypto');
const session = require('express-session');
const validator = require('validator');
const MongoDBStore = require('connect-mongodb-session')(session);
const assert = require('assert');

const mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient;

const app = express();


app.use(function (req, res, next){
    console.log("HTTPS Response", res.statusCode);
    next();
});



const https = require('https');
const PORT = process.env.PORT || 3000;


https.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTPS server on http://localhost:%s", PORT);
});
