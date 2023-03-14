import dao from '../../../models/dao/ProductDAO.js';
import { option2 } from '../apiHelper.js'

export default (paths, application) => {
    const router = option2(dao, '/products');
    application.use(Array.isArray(paths) ? paths.join('') : paths, router);
}