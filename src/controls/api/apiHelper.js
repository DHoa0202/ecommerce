import express from 'express';

const daoEval = (_dao, func, _res, ..._params) => eval(`
    _dao.${func}(..._params)
        .then(result => _res.status(200).json(result))
        .catch(error => _res.status(400).json(error.originalError.info))
        .finally(() => _res)
`);

// hard-delete data
const option1 = (dao, firstPath) => {
    if (!dao) throw `dao is empty!`;
    else if (!firstPath) throw `firstPath is empty!`;

    return express.Router()
        .get(firstPath, (_req, res) => daoEval(dao, 'getList', res, true)) // get all data
        .get(`${firstPath}/:id`, (req, res) => daoEval(dao, 'getByIds', res, req.params['id'])) // get by id
        .post(firstPath, async (req, res) => daoEval(dao, 'insert', res, req.body)) // insert data
        .put(firstPath, (req, res) => daoEval(dao, 'update', res, req.body)) // update data
        .delete(`${firstPath}/:id`, (req, res) => daoEval(dao, 'delete', res, req.params['id'])) // delete an object
        .delete(firstPath, (req, res) => daoEval(dao, 'delete', res, req.body)) // delete multiple objects

}

// Has hard-delete and soft-delete function
const option2 = (dao, firstPath) => {
    if (!dao) throw `dao is empty!`;
    else if (!firstPath) throw `firstPath is empty!`;

    return express.Router()
        .get(firstPath, (_req, res) => daoEval(dao, 'getList', res, true)) // get all data
        .get(`${firstPath}/:id`, (req, res) => daoEval(dao, 'getByIds', res, req.params['id'])) // get by id
        .post(firstPath, async (req, res) => daoEval(dao, 'insert', res, req.body)) // insert data
        .put(firstPath, (req, res) => daoEval(dao, 'update', res, req.body)) // update data
        .delete(`${firstPath}/:id`, (req, res) => daoEval(dao, 'setAccess', res, req.params['id'], false)) // single soft-delete
        .delete(firstPath, (req, res) => daoEval(dao, 'setAccess', res, req.body, false)) // multiple soft-delete
        .delete(`${firstPath}/hard/:id`, (req, res) => daoEval(dao, 'delete', res, req.params['id'])) // single hard-delete
        .delete(`${firstPath}/hard`, (req, res) => daoEval(dao, 'delete', res, req.body)) // multiple hard-delete
};



export default option1
export { option2 }