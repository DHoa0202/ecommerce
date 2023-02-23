import dao from '../src/models/dao/userDAO.js';

const entity = {
    uid: 'abc',
    password: '123',
    name: 'new ABC',
    image: null
}
await dao.delete(entity.uid).then(r => console.log(r))
dao.register(entity).then(r => console.log(r));
// dao.getList(1).then(r => console.log(r))