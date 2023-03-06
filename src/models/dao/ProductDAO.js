import sp, { modify } from '../utils/queryHelper.js';
import { sql } from '../utils/sqlService.js';


export class ProductImage {
    static KEY = 'pr_id';
    static FIELDS = ['pr_id', 'image'];
    static TABLE = '[PRODUCT_IMAGES]';
    static GET_TOP = 10;

    getByPID = async (pr_ids) => {
        const [table, key, fields, top] = [
            ProductImage.TABLE,
            ProductImage.KEY,
            ProductImage.FIELDS,
            ProductImage.GET_TOP
        ];

        if (Array.isArray(pr_ids)) {
            const arr = [];
            for (const pr_id of pr_ids) {
                let query = sp.select(table, top, fields, `WHERE ${key}=${pr_id}`);
                arr.push({ pr_id, images: (await sql.execute(query)).recordset.map(e => e['image']) })
            } return arr;
        } else {
            const query = sp.select(table, top, fields, `WHERE ${key}=${pr_ids}`);
            return sql.execute(query).then(r => r.recordset.map(e => e.image));
        }
    };

    insert = async (pr_id, images, insertOnly) => {
        const [table, key, fields] = [ProductImage.TABLE, ProductImage.KEY, ProductImage.FIELDS];

        if (Array.isArray(images)) {
            images = Array.from(new Set(images)); // unique values
            for (const i in images) images[i] = { [key]: pr_id, image: images[i] }
        } else images = { [key]: pr_id, image: images };

        let query = sp.multipleInsert(table, images, fields);
        return sql.execute(query).then(r => insertOnly
            ? r.rowsAffected.reduce((x, y) => x + y) : images
        );
    };

    // delete by pr_id or (pr_id and image)
    delete = async (pr_ids, images) => {
        const [table, key] = [ProductImage.TABLE, ProductImage.KEY];
        const unique = !Array.isArray(pr_ids);
        const imgExist = Array.isArray(images);
        const _spAbsoluteDelete = (data) => {
            data = modify(data);
            let query = sp.delete(ProductImage.TABLE, ProductImage.KEY, pr_ids);
            let imgCondition = ' AND (';
            for (const image of data) imgCondition += `image=${image} OR `;
            imgCondition = `${imgCondition.substring(0, imgCondition.length - 3)})`;
            query += imgCondition;
        }

        if (unique && imgExist) {
            const query = _spAbsoluteDelete(images);
            return sql.execute(query).then(r => r.rowsAffected[0]);
        } else if (unique) {
            const query = sp.delete(table, key, pr_ids);
            return sql.execute(query).then(r => r.rowsAffected[0]);
        } else {
            const query = sp.multipleDelete(table, key, pr_ids);
            return sql.execute(query).then(r => r.rowsAffected[0]);
        }
    };
}

export class ProductDAO {
    static KEY = 'prid';
    static TABLE = '[PRODUCTS]'// primary key - fields - foreign keys
    static FIELDS = ['subject', 'note', 'price', 'quantity', 'u_id', 'c_id'];
    static IMAGE = 'images';

    #setProducts = async (data) => {
        const [key, image] = [ProductDAO.KEY, ProductDAO.IMAGE];

        if (!data) return [];
        for (const e of data) // get images by prid;
            e[image] = e[key] ? (await prdImgDAO.getByPID(e[key])) : []
        return data; // get roles by uid(username, u_id) and return modified users
    };

    getList = async (access) => {
        const [table] = [ProductDAO.TABLE];
        let query = access == undefined ? sp.select(table)
            : sp.select(table, null, null, `WHERE [access]=${modify(access)}`);
        return sql.execute(query).then(r => this.#setProducts(r.recordset));
    }

    getByIds = async (ids) => {
        const [table, key] = [ProductDAO.TABLE, ProductDAO.KEY];
        let isArr = Array.isArray(ids); // prepare query
        let query = sp.select(table, null, null, 'WHERE');

        if (isArr) { // add condition to read data by id
            for (let id of ids) query += `[${key}]='${id}' OR `;
            query = query.slice(0, query.length - 3) // splice last 'OR '
        } else query += `[${key}]='${ids}'`;

        // execute and modify users to get authorities and format password
        return sql.execute(query).then(async r => isArr
            ? (await this.#setProducts(r.recordset))
            : (await this.#setProducts(r.recordset))[0]
        );
    }

    insert = async (data) => {
        const [table, key, fields] = [ProductDAO.TABLE, ProductDAO.KEY, ProductDAO.FIELDS];
        const isArr = Array.isArray(data); // check object or array<object>
        const query = sp.insert(table, data, fields);

        return sql.execute(query).then(async r => { // insert success > insert images
            const result = r.recordsets.map(e => e[0]);
            for (const i in result) {// check type of data and get image
                const images = isArr ? data[i]['images'] : data['images'];
                // insert product's images and don't get result
                await this.insert(result[i][key], images, true)
                    // past images to result of the insert product
                    .then(_r => result[i]['images'] = images)
                    .catch(err => { // set empty array if error insert images
                        result[i]['images'] = [];
                        console.error(err.message);
                    });
            } return result;
        });
    }

    update = async (data) => {
        const [table, key, fields, image] = [
            ProductDAO.TABLE, ProductDAO.KEY,
            ProductDAO.FIELDS, ProductDAO.IMAGE
        ];
        const isArr = Array.isArray(data);
        const query = sp.update(table, data, fields, 'prid');
        const ids = isArr ? data.map(e => e[key]) : data[key];
        const updateImg = async (key, images) => {
            if (images?.length) {
                await prdImgDAO.delete(key).catch(err => console.error(err.message));
                await prdImgDAO.insert(key, images, true).catch(err => console.error(err.message));
            } return;
        }

        // images already exists => delete data images
        if (isArr) data.forEach(async e => updateImg(e[key], e[image]))
        else updateImg(data[key], data[image]);

        return sql.execute(query).then(async _r => this.getByIds(ids));
    }

    delete = async (ids) => { // delete by single id or multiple id
        let query = sp.delete(table, key, ids);
        return sql.execute(query).then(r => r.rowsAffected.map((x, y) => x + y));
    }
}


const prdImgDAO = new ProductImage();

export { prdImgDAO };
export default new ProductDAO();