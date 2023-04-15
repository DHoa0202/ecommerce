import fs from 'fs';
import multer from "multer";

export class FileHelper {

    constructor(path) {
        this.dest = `./src/assets${path}`;
        if (!fs.existsSync(this.dest)) fs.mkdirSync(this.dest, { recursive: true });
        this.upload = multer({ dest: this.dest });
    }

    readFile = (fileName) => fs.readFileSync(`${this.dest}/${fileName}`);
    readAll = () => fs.readdirSync(this.dest);
    remove = (fileName) => fs.unlinkSync(`${this.dest}/${fileName}`);
    multipleRemove = (fileNames) => {
        const status = { deleted: [], error: [] };
        if (Array.isArray(fileNames))
            for (const fileName of fileNames)
                try {
                    this.remove(fileName);
                    status.deleted.push(fileName);
                } catch (error) {
                    status.error.push(fileName)
                }
        else try {
            this.remove(fileNames);
            status.deleted.push(fileNames);
        } catch (error) {
            status.error.push(fileNames);
        }
        return status;
    }
}

const fileHelperAPI = (application, image) => {
    const path = `/images/${image}`;
    const file = new FileHelper(path);
    
    application
        .get(`/api${path}`, (_req, res) => res
            .status(200).json(file.readAll())
        )
        .post(`/api${path}`, file.upload.any(), (req, res) => res
            .status(200).json(req['files'].map(e => `${path}/${e.filename}`))
        )
        .delete(`/api${path}/:fileName`, (req, res) => {
            const json = { message: undefined }, { fileName } = req.params;
            try {
                res.status(200);
                file.remove(fileName);
                json.message = `${fileName} deleted.`;
            } catch (error) {
                res.status(404);
                // console.error(error);
                json.message = `${fileName} does not exist!`;
            } finally {
                return res.json(json);
            }
        })
        .delete(`/api${path}`, (req, res) => {
            const fileNames = req.query['fn'] || req.body['images'];
            if (Array.isArray(fileNames)) {
                const status = file.multipleRemove(fileNames);
                res.status(200).json(status);
            } else res.status(406).json({ message: 'file-names must be an array' });
            return res;
        });
}
const fileHelperAPIs = (application, ...images) => images.forEach(image => fileHelperAPI(application, image));

export { fileHelperAPI, fileHelperAPIs }
export default (path) => new FileHelper(path);
