const express = require('express')
const bodyParse = require('body-parser')
const app = express();
require("dotenv").config();
let port = process.env.PORT || 5000
module.exports = {
    bodyParse,
    app,
    express,
    port
}