import request, { sql, reseed } from '../src/models/utils/sqlService.js';
import uDAO, { UserDAO } from '../src/models/dao/UserDAO.js';
import aDAO, { role } from '../src/models/dao/AuthorityDAO.js';
import pDAO, { prdImgDAO } from '../src/models/dao/ProductDAO.js';

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ TEST CLASSES
class TestUser {

    static data = {
        entity: {
            uid: 'abc',
            password: { type: "PWDENCRYPT('?')", value: '123' },
            name: 'new ABC',
            image: null,
            roles: [
                { u_id: 'abc', r_id: 1 },
                { u_id: 'abc', r_id: 2 },
            ]
        },

        entities: [
            {
                uid: 'bcd',
                password: { type: "PWDENCRYPT('?')", value: '123' },
                name: 'new BCD',
                image: null,
                roles: [
                    { u_id: 'bcd', r_id: 3 },
                    { u_id: 'bcd', r_id: 5 },
                ]
            }, {
                uid: 'def',
                password: { type: "PWDENCRYPT('?')", value: '123' },
                name: 'new DEF',
                image: null
            }
        ]
    }

    static access = async (data, show) => { // read only
        await uDAO.setAccess(data).then(r => { if (show) console.dir(r); });
        await uDAO.getList(false).then(r => { if (show) console.dir(r); })
    };

    static security = async (data, show) => {
        const { uid, pass, name, image, roles } = data;
        await uDAO.delete(uid).then(r => { if (show) console.dir(r); });
        await uDAO.register(uid, pass, name, image, roles).then(r => { if (show) console.dir(r); });
        await uDAO.login(uid, pass).then(r => { if (show) console.dir(r); });
    }

    static test = async (data, show) => { // multiple data
        const isArr = Array.isArray(data);
        await uDAO.delete(isArr ? data.map(r => r.uid) : data.uid).then(r => { if (show) console.dir(r); })
        await uDAO.insert(data).then(r => { if (show) console.dir(r); })
        await uDAO.update(data).then(r => { if (show) console.dir(r); })
        await uDAO.getById(isArr ? data.map(r => r.uid) : data.uid).then(r => { if (show) console.dir(r); })
    };
}

class TestAuth {

    static data = {
        entity: { u_id: 'def', r_id: 1 },
        entities: [
            { u_id: 'def', r_id: 2 },
            { u_id: 'def', r_id: 3 },
            { u_id: 'def', r_id: 4 },
            { u_id: 'def', r_id: 5 }
        ]
    }

    static test = async (data, show) => {
        await aDAO.getList().then(r => { if (show) console.dir(r); });
        await aDAO.delete(data).then(r => { if (show) console.dir(r); });
        await aDAO.insert(data).then(r => { if (show) console.dir(r); });
        await aDAO.getByIds(data).then(r => { if (show) console.dir(r); });
    };

    static getById = async (data, show) => {
        if (!Array.isArray(data) && Object.keys(data).length < 2)
            await aDAO.getByHalfId(data).then(r => { if (show) console.dir(r); });
        else await aDAO.getByIds(data).then(r => { if (show) console.dir(r); });
    }
}

class TestProduct {
    static data = {
        entity: {
            subject: 'Product 4',
            note: 'Sản phẩm thứ tư',
            price: 10.5,
            quantity: 3,
            u_id: 'admin',
            c_id: 1,
            images: ['product4_1.png', 'product4_2.png']
        },
        entities: [
            {
                subject: 'Product 5',
                note: 'Sản phẩm thứ năm',
                price: 10.5,
                quantity: 235,
                u_id: 'seller',
                c_id: 1,
                images: 'product5_1.png'
            }, {
                subject: 'Product 6',
                note: 'Sản phẩm thứ sáu',
                price: 29,
                quantity: 26,
                u_id: 'seller',
                c_id: 1,
                images: ['product6_1.png', 'product6_2.png', 'product6_2.png']
            }
        ]
    }

    static baseBack = async (at, show) => {
        await request(`DELETE FROM PRODUCTS WHERE prid > ${at || 3}`).then(r => {
            if (show) console.log(`DELETE >>>>>>>>> ${r.rowsAffected[0]} products.`);
        });
        await reseed('PRODUCTS', 'prid'); // delete and reseed identity id
    }

    static test = async (data, show) => {
        const isSingle = !Array.isArray(data);
        const insert = async () => {
            await pDAO.insert(data).then(r => {
                if (isSingle) data['prid'] = Number.parseInt(r['prid']);
                else r.forEach((e, i) => (data[i]['prid'] = Number.parseInt(e['prid'])));
                if (show) console.log(r);
            });
        }

        await insert(); pDAO.delete(isSingle ? data['prid'] : data.map(e => e['prid']));
        await insert(); await pDAO.update(data).then(r => { if (show) console.log(r); });
    }

    static testImg = async (data, show) => {
        const [key1, key2] = ['pr_id', 'images'];
        const isArr = Array.isArray(data);
        const setEntity = (entity) => {
            const { prid, images } = entity;
            return { [key1]: prid, [key2]: (images?.length ? images : []) };
        }
        const singleTestImg = async (e) => {
            await prdImgDAO.insert(e[key1], e[key2], true)
                .then(r => { if (show) console.log(r); })
                .catch(err => console.error(err.message));
        }


        if (isArr) {
            const ids = data.map(e => e[key1] || e['prid']);

            // get all data by list id
            await prdImgDAO.getByPID(ids)
                .then(r => { if (show) console.log(r); })
                .catch(err => console.error(err.message));

            // delete all data by list id
            await prdImgDAO.delete(ids)
                .then(r => { if (show) console.log(r); })
                .catch(err => console.error(err.message));

            for (let e of data) { // single insert each
                e = setEntity(e);
                if (e[key1] && e[key2]) await singleTestImg(e);
                else console.error(`Err: ${key1}: ${e[key1]} && ${key2}: ${e[key2]}`);
            }
        } else {
            const id = data[key1] || data['prid'];
            data = setEntity(data);


            // get all data by list id
            await prdImgDAO.getByPID(id)
                .then(r => { if (show) console.log(r); });

            // delete all data by list id
            await prdImgDAO.delete(id)
                .then(r => { if (show) console.log(r); })

            if (data[key1] && data[key2]) await singleTestImg(data);
            else console.error(`Err: ${key1}: ${data[key1]} && ${key2}: ${data[key2]}`);
        }

    }
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ EXECUTE TEST
const pool = sql.connect;
var show = false;
// --------------------------------------------------- TEST USER
// await TestUser.access(TestUser.data.entity, show); // single
// await TestUser.test(TestUser.data.entity, show);
// await TestUser.access(TestUser.data.entities, show); // multiple
// await TestUser.test(TestUser.data.entities, show);
// const userTest = {
//     uid: 'testRegister', pass: '123', name: 'Name test', image: null,
//     roles: [
//         {u_id: 'testRegister', r_id: 1},
//         {u_id: 'testRegister', r_id: 2},
//         {u_id: 'testRegister', r_id: 3}
//     ]
// };
// await TestUser.security(userTest, show) // security

// // --------------------------------------------------- TEST AUTH
// await TestAuth.test(TestAuth.data.entity, show) // single
// await TestAuth.getById(TestAuth.data.entity, show)
// await TestAuth.getById({u_id: 'abc'}, show) // single-halfId
// await TestAuth.getById({R_id: 1}, show)
// await TestAuth.test(TestAuth.data.entities, show) // multipe
// await TestAuth.getById(TestAuth.data.entities, show)
// await role.getList().then(r => { if (show) console.log(r) }) // ---------- ROLES
// await role.getByIds([1,2]).then(r => { if (show) console.log(r) }) 

// // --------------------------------------------------- TEST PRODUCTS
// await TestProduct.baseBack(undefined, show);
// await TestProduct.test(TestProduct.data.entity, show) // single
// await TestProduct.test(TestProduct.data.entities, show) // multiple
// await TestProduct.testImg(TestProduct.data.entity, show); // single entity's images
// await TestProduct.testImg(TestProduct.data.entities, show); // multiple entities're data['prid']

await pool.close();
console.log(pool.connected
    ? "Connected DB_ECOM, it's currently in use."
    : "Closed connection to DB_ECOM."
);