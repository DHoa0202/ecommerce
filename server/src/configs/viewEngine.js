import express from "express";

function viewEngine(app) {
    app.use(express.static('./src/assets'));
};

export default viewEngine;