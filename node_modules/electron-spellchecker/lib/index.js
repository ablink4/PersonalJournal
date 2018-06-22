'use strict';

var _contextMenuBuilder = require('./context-menu-builder');

var _contextMenuBuilder2 = _interopRequireDefault(_contextMenuBuilder);

var _contextMenuListener = require('./context-menu-listener');

var _contextMenuListener2 = _interopRequireDefault(_contextMenuListener);

var _dictionarySync = require('./dictionary-sync');

var _dictionarySync2 = _interopRequireDefault(_dictionarySync);

var _spellCheckHandler = require('./spell-check-handler');

var _spellCheckHandler2 = _interopRequireDefault(_spellCheckHandler);

var _nodeSpellchecker = require('./node-spellchecker');

var _nodeSpellchecker2 = _interopRequireDefault(_nodeSpellchecker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Overrides the default logging function (the `debug` library) with another
 * logger.
 *
 * @param {Function}  fn    The `console.log` like function that will write debug
 *                          information to.
 */
function setGlobalLogger(fn) {
  for (let klass of [_contextMenuBuilder2.default, _contextMenuListener2.default, _dictionarySync2.default, _spellCheckHandler2.default]) {
    klass.setLogger(fn);
  }
}

module.exports = {
  ContextMenuBuilder: _contextMenuBuilder2.default,
  ContextMenuListener: _contextMenuListener2.default,
  DictionarySync: _dictionarySync2.default,
  SpellCheckHandler: _spellCheckHandler2.default,
  SpellChecker: _nodeSpellchecker2.default,
  setGlobalLogger
};