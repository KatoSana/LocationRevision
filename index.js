'use strict';
//require('dotenv').config();

const service = require('./service/Revision');

const server = app.listen(process.env.PORT || 3000, () => {
    console.log(process.env.MONGO_EXPRESS_AVAILABLE);
    console.log('Node.js is listening to PORT:' + server.address().port);
  });

class index {
    static async revisionFile(start){
        service.revisionFile(start);
    }
}
const startTime = 1606834800000
index.revisionFile(startTime)