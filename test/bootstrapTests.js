const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
require('foreach-end');

chai.should();
chai.use(chaiAsPromised);

process.env.TESTING = 'true';
