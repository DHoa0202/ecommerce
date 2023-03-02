import sp from '../utils/queryHelper.js';
import { sql } from '../utils/sqlService.js';
import authorityDAO from './AuthorityDAO.js'

const util = {
    setUsers: async (users) => {
        if (!users) return [];
        for (const u of users) {
            u.password = u.password.toString('base64');
            u[UserDAO.ROLES] = (await authorityDAO.getByHalfId({ u_id: u.uid }));
        } return users;
    }
}

export class UserDAO {

    static KEY = 'uid';
    static TABLE = '[USERS]';
    static FIELDS = [UserDAO.KEY, 'password', 'name', 'image'];
    static ROLES = 'roles'; // references

    getList = async (accept) => {
        // prepare query
        const query = sp.select(accept == null ? UserDAO.TABLE
            : `${UserDAO.TABLE} WHERE accept=${accept ? 1 : 0}`
        );
        // execute query
        return sql.execute(query).then(async r => await util.setUsers(r.recordset))
    };

    getById = async (ids) => {
        let isArr = Array.isArray(ids);
        let query = sp.select(UserDAO.TABLE, 'WHERE');

        if (isArr) {
            for (let id of ids) query += `[${UserDAO.KEY}]='${id}' OR `;
            query = query.slice(0, query.length - 3)
        } else query += `[${UserDAO.KEY}]='${ids}'`;

        return sql.execute(query).then(async r => isArr
            ? (await util.setUsers(r.recordset))
            : (await util.setUsers(r.recordset))[0]
        );
    };

    insert = async (data) => {
        const isArr = Array.isArray(data);
        const query = sp.insert(UserDAO.TABLE, data, UserDAO.FIELDS, UserDAO.KEY);

        return sql.execute(query).then(async _r => {
            if (isArr) for(const e of data) {
                if (e[UserDAO.ROLES]) authorityDAO.insert(e[UserDAO.ROLES]);
            } else if (data[UserDAO.ROLES]) authorityDAO.insert(data[UserDAO.ROLES]);

            return isArr
                ? this.getById(data.map(e => e[UserDAO.KEY]))
                : this.getById(data[UserDAO.KEY])
        });
    };

    update = async (data) => {
        const query = sp.update(UserDAO.TABLE, data, UserDAO.FIELDS, UserDAO.KEY);
        return sql.execute(query).then(async _r => this.getById(
            Array.isArray(data) ? data.map(e => e[UserDAO.KEY]) : data[UserDAO.KEY]
        ));
    };

    setAccept = async (data) => {
        const query = sp.update(UserDAO.TABLE, data, ['uid', 'accept'], UserDAO.KEY);
        return sql.execute(query).then(async _r => this.getById(
            Array.isArray(data) ? data.map(e => e[UserDAO.KEY]) : data[UserDAO.KEY]
        ));
    }

    delete = async (ids) => {
        const query = sp.delete(UserDAO.TABLE, UserDAO.KEY, ids);
        return sql.execute(query).then(async r => r.rowsAffected.reduce((a, b) => a + b));
    };

}

export default new UserDAO();