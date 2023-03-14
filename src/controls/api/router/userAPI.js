import dao from '../../../models/dao/UserDAO.js';
import { option2 } from '../apiHelper.js';

export default (paths, application) => {
    const router = option2(dao, '/users');
    application.use(Array.isArray(paths) ? paths.join('') : paths, router);
}