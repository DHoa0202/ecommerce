import moment from 'moment'

const util = {
    insert: (table, keys, values) => {
        keys = keys.join('\x2c'); // get values by keys
        eval(`const{${keys}}=values; values=Object.values({${keys}}).join('\x2c')`);
        return `INSERT INTO ${table}(${keys}) VALUES(${values});\n`;
    },
    update: (table, keys, values, _id) => {
        let query = `UPDATE ${table} SET`;
        for (let k of keys) query += ` ${k}=${(typeof values[k] == 'undefined') ? 0 : values[k]},`;
        return `${query.slice(0, query.length - 1)} WHERE ${_id || keys[0]}=${values[_id || keys[0]]};\n`;
    },
    evaluate: (_table, _data, _keys, type, _id) => {
        let query = new String();
        eval(`
            if (Array.isArray(_data)) {
                for (let e of _data)
                    query += util.${type}(_table, _keys || Object.keys(e), modify(e), _id);
            } else query = util.${type}(_table, _keys || Object.keys(_data), modify(_data), _id);
        `);
        return query;
    }
}

const modify = (data) => {
    if (data === null) return 'NULL';
    else if (Array.isArray(data)) {
        data = Object.assign([], data);// to avoid overwriting
        for (const i in data) data[i] = modify(data[i]);
        return data;
    } else switch (typeof data) {
        case 'string':
            return `N'${data}'`;
        case 'boolean': case 'undefined':
            return data ? 1 : 0;
        case 'object':
            if (data instanceof Date) return `'${date.format(data)}'`;
            data = Object.assign({}, data); // to avoid overwriting
            if (data.type) return data.type.replace('?', data.value);
            else for (const i of Object.keys(data)) data[i] = modify(data[i])
            return data;
        default: return data;
    }
}

const date = {
    format: (data, format) => moment(data).format(format || 'YYYY-MM-DD HH:mm:ss.SSS'),
    setTo: (entity, key, format) => entity[key] = date.format(entity[key], format)
}

const query = {
    select: (table, ...serials) => `SELECT * FROM ${table} ${serials.join('\xa0')}`,
    insert: (table, data, keys) => util.evaluate(table, data, keys, 'insert'),
    update: (table, data, keys, fieldId) => util.evaluate(table, data, keys, 'update', fieldId),
    delete: (table, key, ids) => {
        let query = new String();
        if (Array.isArray(ids))
            for (let id of modify(ids))
                query += `DELETE FROM ${table} WHERE ${key} = ${id}\n`;
        else query += `DELETE FROM ${table} WHERE ${key} = ${modify(ids)}\n`;
        return query;
    },
    multipleInsert: (table, data, keys) => {
        let query = `INSERT INTO ${table}(${keys}) VALUES\n`;
        const compileInsert = `const{${keys}}=e; e=Object.values({${keys}}).join('\x2c')`

        data = modify(data);
        if (Array.isArray(data)) {
            for (let e of data) {
                eval(compileInsert);
                query += `(${e}),\n`
            } return query.substring(0, query.length-2);
        } else {
            let e = data;
            eval(compileInsert);
            return query+=`(${e})`;
        }
    }
}

export { modify, date }
export default query;