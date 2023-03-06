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

const reseed = async (table, key) => {
    const pool = new mssql.ConnectionPool(config);
    const conn = await pool.connect();
    // the first session get max identity by id
    let query = `SELECT MAX(${key}) as max FROM ${table}`;
    const max = (await conn.query(query)).recordset[0]?.max || 1;
    // seconds session RESEED key identity
    query = `DBCC CHECKIDENT ('${table}', RESEED, ${max});`;
    return (await conn.query(query).finally(() => conn.close()));
}

export { sql, reseed }
export default request;