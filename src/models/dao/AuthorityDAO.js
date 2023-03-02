import sp, { modify } from '../utils/queryHelper.js';
import { sql } from '../utils/sqlService.js';

const _sp = {
    delete: (ids) => {
        const [id1, id2] = AuthorityDAO.FIELDS;
        let query = `DELETE FROM ${AuthorityDAO.TABLE} WHERE `;

        if (Array.isArray(ids)) {
            for (const id of modify(ids))
                query += `(${id1}=${id[id1]} AND ${id2}=${id[id2]})\nOR`;
            query = query.slice(0, query.length - 3);
        } else {
            const id = modify(ids);
            query += `(${id1}=${id[id1]} AND ${id2}=${id[id2]})`;
        } return query;
    }
}

export class AuthorityDAO {
    static TABLE = '[AUTHORITIES]';
    static FIELDS = ['u_id', 'r_id'];

    getList = async () => {
        const query = sp.select(AuthorityDAO.TABLE);
        return sql.execute(query).then(async r => r.recordset)
    };

    getByHalfId = async(id) => {
        const key = Object.keys(id)[0];
        const query = sp.select(AuthorityDAO.TABLE, `WHERE ${key} = ${modify(id[key])}`);
        return sql.execute(query).then(async r => r.recordset)
    }

    getById = async (ids) => {
        let query = sp.select(AuthorityDAO.TABLE, 'WHERE ');
        const isArr = Array.isArray(ids);

        if (isArr) {
            for (const id of ids) {
                const { u_id, r_id } = modify(id);
                query += `(u_id=${u_id} AND r_id=${r_id}) OR `;
            } query = query.slice(0, query.length - 3);
        } else {
            const { u_id, r_id } = modify(ids);
            query += `(u_id=${u_id} AND r_id=${r_id})`;
        }
        return sql.execute(query).then(async r => r.recordset)
    };

    insert = async (data) => {
        const query = sp.multipleInsert(AuthorityDAO.TABLE, data, AuthorityDAO.FIELDS);
        return sql.execute(query).then(async _r => this.getById(data));
    };

    delete = async (ids) => {
        let query = _sp.delete(ids);
        return sql.execute(query).then(async r => r.rowsAffected[0]);
    };
}

export default new AuthorityDAO();