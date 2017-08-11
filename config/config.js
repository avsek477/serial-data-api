/**
 * Created by avsek on 8/10/17.
 */
'use strict';
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    port: process.env.PORT || 1234
}