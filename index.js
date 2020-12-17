'use strict';
require('dotenv').config();

const service = require('./service/Revision');

class index {
    static async revisionFile(start){
        service.revisionFile(start);
    }
}
const startTime = 1606921200000
index.revisionFile(startTime)