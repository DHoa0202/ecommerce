import sp from '../utils/queryHelper.js';
import { sql } from '../utils/sqlService.js';
import authorityDAO from './AuthorityDAO.js'

export class UserDAO {

    static KEY = 'uid';
    static TABLE = '[USERS]';
    static FIELDS = [UserDAO.KEY, 'password', 'name', 'image'];
    static ROLES = 'roles'; // references

    #setUsers = async (users) => {
        if (!users) return [];
        for (const u of users) {
            u.password = u.password.toString('base64'); // format Buffer to base64
            u[UserDAO.ROLES] = (await authorityDAO.getByHalfId({ u_id: u.uid }));
        } return users; // get roles by uid(username, u_id) and return modified users
    }

    getList = async (accept) => { // prepare query > get user > set user > return user
        const query = sp.select(accept == null ? UserDAO.TABLE
            : `${UserDAO.TABLE} WHERE accept=${accept ? 1 : 0}`
        );
        // execute query to get user > set user, get authorities > return data
        return sql.execute(query).then(async r => await this.#setUsers(r.recordset))
    };

    getById = async (ids) => {
        let isArr = Array.isArray(ids); // prepare query
        let query = sp.select(UserDAO.TABLE, 'WHERE');

        if (isArr) { // add condition to read data by id
            for (let id of ids) query += `[${UserDAO.KEY}]='${id}' OR `;
            query = query.slice(0, query.length - 3) // splice last 'OR '
        } else query += `[${UserDAO.KEY}]='${ids}'`;

        // execute and modify users to get authorities and format password
        return sql.execute(query).then(async r => isArr
            ? (await this.#setUsers(r.recordset))
            : (await this.#setUsers(r.recordset))[0]
        );
    };

    insert = async (data) => { // insert data > get all data updated > return new data
        const isArr = Array.isArray(data); // prepare query
        const query = sp.insert(UserDAO.TABLE, data, UserDAO.FIELDS, UserDAO.KEY);

        return sql.execute(query).then(async _r => { // insert query
            if (isArr) for (const e of data) { // insert authorities when roles exists
                if (e[UserDAO.ROLES]) authorityDAO.insert(e[UserDAO.ROLES]);
            } else if (data[UserDAO.ROLES]) authorityDAO.insert(data[UserDAO.ROLES]);

            return isArr // is array to read all by ids <> read by id
                ? this.getById(data.map(e => e[UserDAO.KEY]))
                : this.getById(data[UserDAO.KEY])
        });
    };

    update = async (data) => { // update data > get all data inserted > return new data
        const query = sp.update(UserDAO.TABLE, data, UserDAO.FIELDS, UserDAO.KEY);
        return sql.execute(query).then(async _r => this.getById( // get new data
            Array.isArray(data) ? data.map(e => e[UserDAO.KEY]) : data[UserDAO.KEY]
        ));
    };

    setAccept = async (data) => { // update accept to access data
        const query = sp.update(UserDAO.TABLE, data, ['uid', 'accept'], UserDAO.KEY);
        return sql.execute(query).then(async _r => this.getById( // get new data
            Array.isArray(data) ? data.map(e => e[UserDAO.KEY]) : data[UserDAO.KEY]
        ));
    }

    delete = async (ids) => { // delete by id or multiple ids > return Total of the rowsAffected
        const query = sp.delete(UserDAO.TABLE, UserDAO.KEY, ids);
        return sql.execute(query).then(async r => r.rowsAffected.reduce((a, b) => a + b));
    };

}

export default new UserDAO();