import dao from '../../../models/dao/UserDAO.js';
import middleware from '../../middleware/access.js';
import jsonToken from '../../../models/utils/jsontoken.js';
import { option2, daoEval } from '../../../models/utils/apiHelper.js';

const security = {
    // login by username and password
    login: async (req, res) => {
        res.header('Access-Control-Allow-Methods', 'POST,PUT');
        let auth = req.headers['authorization']; // priority 1
        const { username, password } = req.body; // priority 2

        if (auth) {
            auth = auth.replace('Bearer ', '');
            return res.status(200).json(jsonToken.verify(auth))
        } else return dao.login(username, password)
            .then(account => {
                delete account?.password;
                if (!account) return res.status(401).json({
                    account: { username, password },
                    message: "username or password incorrect!!!"
                });
                return res.status(200).json(Object.assign(account, { accessToken: jsonToken.sign(account) }));
            }).catch(err => res.status(401).json({ message: err }));
    },

    // login by username and password
    logout: (req, res, _next) => {
        res.header('Access-Control-Allow-Methods', 'POST,PUT');
        const token = req.body['authorization'];
        if (token) {
            console.log(token);
        }

        return res.status(200).json({ message: `you have successfully logged out` })
    }
}

export default (paths, application) => {
    const lastPath = '/users';
    const router = option2(dao, lastPath);

    console.log(`${lastPath}/login`);
    application // Allow-Methods: POST,PUT
        .use(`${lastPath}/login`, middleware, security.login)
        .use(`${lastPath}/logout`, middleware, security.logout);

    application.use(paths = Array.isArray(paths) ? paths.join('') : paths, middleware, router);
}