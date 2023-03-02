import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import moment from 'moment';

const properties = dotenv.config().parsed;
const {SECRET, EXPIRESIN} = properties;
const option = { expiresIn: EXPIRESIN }; // an hour [s,m,h...]

// RESTRTCT EXECUTE QUERY
const jsonToken = {
    sign: (object) => jwt.sign(object, SECRET, option),
    verify: (token) => {
        try {
            const object = jwt.verify(token, SECRET, option);
            return object;
        } catch (error) {
            moment.locale('en')
            const time = moment(error.expiredAt).format('LLLL')
            return { message: `access token expired at: ${time}` }
        }
    }
}
export default jsonToken;