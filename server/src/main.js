import os from 'os'
import dotenv from "dotenv";
import express from 'express';
import viewEngine from './configs/viewEngine.js';
import controller from './controls/controller.js';

// VARIABLES
const properties = dotenv.config().parsed;
const application = express();
const ipHost = properties.HOST || 'localhost';
const port = properties.PORT || 8080;
const [hostDesk, IPv4] = [os.hostname(),
os.networkInterfaces()['Wi-Fi'][1]?.address
];

// CONFIGURATION
viewEngine(application); // configuration
controller(application); // controller

// START SERVER
application.listen(port, () => {
    console.log('--++++++++++++++++++++++ LOCAL ++++++++++++++++++++++--');
    for (const host of ['localhost', ipHost])
        console.log(`- RESTapi on server http://${host}:${port}/api`);

    console.log('--++++++++++++++++++++ LAN_ACCESS +++++++++++++++++++--');
    for (const host of [hostDesk, IPv4])
        console.log(`- RESTapi on server http://${host}:${port}/api`);
});