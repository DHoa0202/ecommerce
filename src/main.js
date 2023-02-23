import dotenv from 'dotenv';
import express from 'express';
import viewEngine from './configuration/viewEngine.js';
import controller from './controls/controller.js';

// VARIABLES
const properties = dotenv.config().parsed;
const application = express();
const host = properties.HOST || 'localhost';
const port = properties.PORT || 8080;

// CONFIGURATION
viewEngine(application); // configuration
controller(application); // controller

// START SERVER
application.listen(port, () => console.log(
    `\napplication start on http://${host}:${port}`,
    `\ndisplay on server http://${host}:${port}/app`,
    // `\ncall RESTapi http://${host}:${port}/api\n`,
));