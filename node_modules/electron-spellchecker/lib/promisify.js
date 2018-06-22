'use strict';

var _pify = require('pify');

var _pify2 = _interopRequireDefault(_pify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = ['fs', 'mkdirp'].reduce((acc, x) => {
  acc[x] = (0, _pify2.default)(require(x));
  return acc;
}, {});