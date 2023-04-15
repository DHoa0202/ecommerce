import { fileHelperAPIs } from '../models/utils/fileHelper.js';
import api_application from './router/api.js';

export default (application) => {
    fileHelperAPIs(application, 'user', 'category', 'product');
    api_application(application); // USE API FOR CLIENT : /api
};