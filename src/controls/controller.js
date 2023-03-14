import express from 'express';
import userAPI from "./api/router/userAPI.js";
import productAPI from "./api/router/productAPI.js";

export default (application) => {
    const FIRST_PATH = '/api/v1';
    application.use(express.json());
    userAPI(FIRST_PATH, application);
    productAPI(FIRST_PATH, application);
};