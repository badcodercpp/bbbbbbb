import _get from 'lodash/get';
import _head from 'lodash/head';
import _isEqual from 'lodash/isEqual';
import _isEmpty from 'lodash/isEmpty';
import uploader from '../../db/connection/mongo/auth/uploader';
const uuidv1 = require('uuid/v1');

const doUploadMedia = (req, res) => {
    const parsedBody = req.body || {};
    const mediaType = _get(parsedBody, 'mediaType');
    const media = _get(parsedBody, [mediaType]);
    const mime = _get(parsedBody, 'mime');
    const mediId = uuidv1();
    const options = {
        media,
        type: mediaType,
        mime: `${mediaType}/${mime}`,
        mediId
    }
    uploader(options).then((data) => {
        const respAuth = {
            success: true,
            message: 'Upload successful!',
            data,
        };
        res.status(200);
        res.send(respAuth);
    }).catch((error) => {
        const respAuth = {
            success: false,
            message: 'Upload successful!',
            error,
        };
        res.status(500);
        res.send(respAuth);
    });
}

export default doUploadMedia;