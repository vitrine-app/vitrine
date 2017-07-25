/* jQuery */
window.jQuery = window.$ = require('jquery');

/* Bootstrap JS */
require('bootstrap-sass');

console.log('jQuery and Bootstrap added.');

/* Init client page */
require('./init');

/* Handle server events */
require('./events');

/* Register DOM events */
require('./dom');