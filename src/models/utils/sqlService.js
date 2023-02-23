import mssql from "mssql"
import dotenv from "dotenv"
import config from '../../configuration/mssqlConfig.js';

const show = (dotenv.config().parsed?.SHOW_SQL == 'true') || false;
const sql = {
    connect: (await mssql.connect(config)),
    execute: async (...serials) => {
        const pool = sql.connect;
        let query = serials.join('\xa0').toString();
        if (show) console.log(query);
        return await pool.query(query);
    }
}

const request = async (...serials) => {
    const pool = (await mssql.connect(config)).request();
    let query = serials.join('\xa0').toString();
    if (show) console.log(query);
    return pool.query(query);
}

export { sql }
export default request;