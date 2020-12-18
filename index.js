'use strict';
require('dotenv').config();

const cron = require('node-cron');
const service = require('./service/Revision');


class index {
    static run(){
        var date = new Date();
        var time = date.getTime();
        var start = time - 87000000
        service.revisionFile(start);
    }
}
//毎日0時10分に実行
cron.schedule('0 10 0 * * *', () => index.run());