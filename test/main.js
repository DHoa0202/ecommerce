import { sql } from '../src/models/utils/sqlService.js';
import uDAO, { UserDAO } from '../src/models/dao/UserDAO.js';
import aDAO from '../src/models/dao/AuthorityDAO.js';

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
        await aDAO.getById(data).then(r => { if (show) console.dir(r); });
    };

    static getById = async (data, show) => {
        if (!Array.isArray(data) && Object.keys(data).length < 2)
            await aDAO.getByHalfId(data).then(r => { if (show) console.dir(r); });
        else await aDAO.getById(data).then(r => { if (show) console.dir(r); });
    }
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ EXECUTE TEST
const show = false;
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

// // --------------------------------------------------- TEST AUHT
// await TestAuth.test(TestAuth.data.entity, show) // single
// await TestAuth.getById(TestAuth.data.entity, show)
// await TestAuth.getById({u_id: 'abc'}, show) // single-halfId
// await TestAuth.getById({R_id: 1}, show)
// await TestAuth.test(TestAuth.data.entities, show) // multipe
// await TestAuth.getById(TestAuth.data.entities, show)

const pool = sql.connect;
pool.close();
console.log(pool.connected
    ? "Connected DB_ECOM, it's currently in use."
    : "Closed connection to DB_ECOM."
);