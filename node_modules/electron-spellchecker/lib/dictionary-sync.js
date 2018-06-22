'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _Observable = require('rxjs/Observable');

require('rxjs/add/observable/of');

require('rxjs/add/operator/mergeMap');

require('rxjs/add/operator/reduce');

require('rxjs/add/operator/toPromise');

var _promisify = require('./promisify');

var _utility = require('./utility');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let getURLForHunspellDictionary;
let d = require('debug')('electron-spellchecker:dictionary-sync');

const app = process.type === 'renderer' ? require('electron').remote.app : require('electron').app;

var _require$requireTaskP = require('electron-remote').requireTaskPool(require.resolve('electron-remote/remote-ajax'));

const downloadFileOrUrl = _require$requireTaskP.downloadFileOrUrl;

/**
 * DictioanrySync handles downloading and saving Hunspell dictionaries. Pass it
 * to {{SpellCheckHandler}} to configure a custom cache directory.
 */

class DictionarySync {
  /**
   * Creates a DictionarySync
   *
   * @param  {String} cacheDir    The path to a directory to store dictionaries.
   *                              If not given, the Electron user data directory
   *                              will be used.
   */
  constructor() {
    let cacheDir = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    // NB: Require here so that consumers can handle native module exceptions.
    getURLForHunspellDictionary = require('./node-spellchecker').getURLForHunspellDictionary;

    this.cacheDir = cacheDir || _path2.default.join(app.getPath('userData'), 'dictionaries');
    _mkdirp2.default.sync(this.cacheDir);
  }

  /**
   * Override the default logger for this class. You probably want to use
   * {{setGlobalLogger}} instead
   *
   * @param {Function} fn   The function which will operate like console.log
   */
  static setLogger(fn) {
    d = fn;
  }

  /**
   * Loads the dictionary for a given language code, trying first to load a
   * local version, then downloading it. You probably don't want this method
   * directly, but the wrapped version
   * {{loadDictionaryForLanguageWithAlternatives}} which is in {{SpellCheckHandler}}.
   *
   * @param  {String} langCode        The language code (i.e. 'en-US')
   * @param  {Boolean} cacheOnly      If true, don't load the file content into
   *                                  memory, only download it
   *
   * @return {Promise<Buffer|String>}     A Buffer of the file contents if
   *                                      {{cacheOnly}} is False, or the path to
   *                                      the file if True.
   */
  loadDictionaryForLanguage(langCode) {
    var _this = this;

    let cacheOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    return _asyncToGenerator(function* () {
      d(`Loading dictionary for language ${langCode}`);
      if (process.platform === 'darwin') return new Buffer([]);

      let lang = (0, _utility.normalizeLanguageCode)(langCode);
      let target = _path2.default.join(_this.cacheDir, `${lang}.bdic`);

      let fileExists = false;
      try {
        if (_promisify.fs.existsSync(target)) {
          fileExists = true;

          d(`Returning local copy: ${target}`);
          let ret = yield _promisify.fs.readFile(target, {});

          if (ret.length < 8 * 1024) {
            throw new Error("File exists but is most likely bogus");
          }

          return ret;
        }
      } catch (e) {
        d(`Failed to read file ${target}: ${e.message}`);
      }

      if (fileExists) {
        try {
          yield _promisify.fs.unlink(target);
        } catch (e) {
          d("Can't clear out file, bailing");
          throw e;
        }
      }

      let url = getURLForHunspellDictionary(lang);
      d(`Actually downloading ${url}`);
      yield downloadFileOrUrl(url, target);

      if (cacheOnly) return target;

      let ret = yield _promisify.fs.readFile(target, {});
      if (ret.length < 8 * 1024) {
        throw new Error("File exists but is most likely bogus");
      }

      return ret;
    })();
  }

  preloadDictionaries() {
    // NB: This is retained solely to not break earlier versions
    return _Observable.Observable.of(true);
  }
}
exports.default = DictionarySync;