import sp, { setValues } from '../utils/query.js';
import request, { sql } from '../utils/sqlService.js';

const _sp = {
    select: (accept) => accept === undefined ? 'SELECT * FROM USERS' : `SELECT * FROM USERS WHERE accept=${accept}`,
    byId: (uid) => `${_sp.select()} WHERE uid='${uid}'`,
    roles: (uid) => `SELECT r.rid, r.name FROM AUTHORITIES a INNER JOIN ROLES r ON a.r_id=r.rid WHERE u_id='${uid}'`,
    login: (username, password) => `EXECUTE SP_LOGIN '${username}', '${password}'`,

    register: (entity) => {
        setValues(entity);
        const { uid, password, name, image } = entity
        return `EXECUTE SP_REGISTER ${uid}, ${password}, ${name}, ${image}`;
    },
    softDelete: (uid) => `UPDATE USERS SET accept=0 WHERE uid='${uid}'`
}

const setUser = async (users) => {
    if (!users) return [];
    for (const u of users) {
        u.password = u.password.toString('base64');
        await sql.execute(_sp.roles(u.uid)).then(rs => u['roles'] = rs.recordset);
    } return users;
}

const execute = async (query, ...serials) => {
    const pool = sql.connect;
    return sql.execute(query, ...serials)
        .then(async r => await setUser(r.recordset))
        .finally(() => pool.close());
};

class UserDAO {

    // READ
    getList = (accept) => execute(_sp.select(accept));

    getById = (id) => execute(_sp.byId(id)).then(r => r[0]);

    login = (username, password) => execute(_sp.login(username, password)).then(r => r[0]);

    // INSERT
    register = async (entity) => {
        const pool = sql.connect;
        return sql.execute(_sp.register(entity))
            .then(async r => (await setUser(r.recordset))[0])
            .finally(() => pool.close());
    };

    insert = (entity) => { };

    // UPDATE
    update = (entity) => { };

    softDelete = (id) => request(_sp.softDelete(id)).then(r => r.rowsAffected[0]);

    // DELETE -> hard delete
    delete = async (id) => request(sp.delete('USERS', 'uid', `'${id}'`)).then(r => r.rowsAffected[0]);
}

export default new UserDAO();