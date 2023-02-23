import express from "express";

function viewEngine(app) {
    app.use(express.static('./src/app_static'));
    app.set('view engine', 'ejs');
    app.set('views', './src/views')
};

export default viewEngine;