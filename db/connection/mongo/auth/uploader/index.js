
import { MONGO } from '../../config';
import { DB_ERROR } from '../../dbError'
import { queryExecuter } from '../../query';
import { connect } from '../../connection';
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';

const uploader = (payload) => {
    const dbName = MONGO.DB;
    const userSignupPromise = new Promise((res, rej) => {
        connect().then(async (client) => {
            const db = client.db(dbName);
            const collection = db.collection(MONGO.COLLECTION.badCollection);
            const data = await queryExecuter(collection, 'insertOne', client, [payload], true);
            if (!_isEmpty(data)) {
                res(payload);
            } else {
                rej({ error: DB_ERROR.GENERIC })
            }
        }).catch((err) => {
            rej({ error: err })
        })
    })
    return userSignupPromise;
}

export default uploader;