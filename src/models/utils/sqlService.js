import mssql from "mssql"
import dotenv from "dotenv"
import config from '../../configuration/mssqlConfig.js';

const show = (dotenv.config().parsed?.SHOW_SQL == 'true') || false;

// Keep connection waiting to close
const sql = {
    connect: (await mssql.connect(config)),
    execute: async (query) => {
        if (show) console.log(query);
        return sql.connect.query(query);
    }
}

// Connect and close instantly
const request = async (query) => {
    const pool = (await mssql.connect(config)).request();
    if (show) console.log(query);
    return pool.query(query);
}

export { sql }
export default request;