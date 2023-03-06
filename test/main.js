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

    static accept = async (data, show) => { // read only
        await uDAO.setAccept(data).then(r => { if (show) console.dir(r); });
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


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ EXECUTE TEST
const pool = sql.connect;
var show = false;
// --------------------------------------------------- TEST USER
// await TestUser.accept(TestUser.data.entity, show); // single
// await TestUser.test(TestUser.data.entity, show);
// await TestUser.accept(TestUser.data.entities, show); // multiple
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
const data = {
    entity: {
        prid: 4,
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
            prid: 5,
            subject: 'Product 5',
            note: 'Sản phẩm thứ năm',
            price: 10.5,
            quantity: 235,
            u_id: 'seller',
            c_id: 1,
            images: ['product5_1.png']
        }, {
            prid: 6,
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

reseed('PRODUCTS', 'prid');
await pDAO.update(data.entities).then(r => { if (show) console.log(r); });

await pool.close();
console.log(pool.connected
    ? "Connected DB_ECOM, it's currently in use."
    : "Closed connection to DB_ECOM."
);