'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _spawnRx = require('spawn-rx');

var _electronRemote = require('electron-remote');

var _lruCache = require('lru-cache');

var _lruCache2 = _interopRequireDefault(_lruCache);

var _Subscription = require('rxjs/Subscription');

var _Observable = require('rxjs/Observable');

var _Subject = require('rxjs/Subject');

var _rxjsSerialSubscription = require('rxjs-serial-subscription');

var _rxjsSerialSubscription2 = _interopRequireDefault(_rxjsSerialSubscription);

require('rxjs/add/observable/defer');

require('rxjs/add/observable/empty');

require('rxjs/add/observable/fromEvent');

require('rxjs/add/observable/fromPromise');

require('rxjs/add/observable/of');

require('rxjs/add/operator/catch');

require('rxjs/add/operator/concat');

require('rxjs/add/operator/concatMap');

require('rxjs/add/operator/do');

require('rxjs/add/operator/filter');

require('rxjs/add/operator/mergeMap');

require('rxjs/add/operator/merge');

require('rxjs/add/operator/observeOn');

require('rxjs/add/operator/reduce');

require('rxjs/add/operator/startWith');

require('rxjs/add/operator/take');

require('rxjs/add/operator/takeUntil');

require('rxjs/add/operator/throttle');

require('rxjs/add/operator/toPromise');

require('./custom-operators');

var _dictionarySync = require('./dictionary-sync');

var _dictionarySync2 = _interopRequireDefault(_dictionarySync);

var _utility = require('./utility');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let Spellchecker;

let d = require('debug')('electron-spellchecker:spell-check-handler');

const cld = (0, _electronRemote.requireTaskPool)(require.resolve('./cld2'));
let fallbackLocaleTable = null;
let webFrame = process.type === 'renderer' ? require('electron').webFrame : null;

// NB: Linux and Windows uses underscore in languages (i.e. 'en_US'), whereas
// we're trying really hard to match the Chromium way of `en-US`
const validLangCodeWindowsLinux = /[a-z]{2}[_][A-Z]{2}/;

const isMac = process.platform === 'darwin';

// NB: This is to work around electron/electron#1005, where contractions
// are incorrectly marked as spelling errors. This lets people get away with
// incorrectly spelled contracted words, but it's the best we can do for now.
const contractions = ["ain't", "aren't", "can't", "could've", "couldn't", "couldn't've", "didn't", "doesn't", "don't", "hadn't", "hadn't've", "hasn't", "haven't", "he'd", "he'd've", "he'll", "he's", "how'd", "how'll", "how's", "I'd", "I'd've", "I'll", "I'm", "I've", "isn't", "it'd", "it'd've", "it'll", "it's", "let's", "ma'am", "mightn't", "mightn't've", "might've", "mustn't", "must've", "needn't", "not've", "o'clock", "shan't", "she'd", "she'd've", "she'll", "she's", "should've", "shouldn't", "shouldn't've", "that'll", "that's", "there'd", "there'd've", "there're", "there's", "they'd", "they'd've", "they'll", "they're", "they've", "wasn't", "we'd", "we'd've", "we'll", "we're", "we've", "weren't", "what'll", "what're", "what's", "what've", "when's", "where'd", "where's", "where've", "who'd", "who'll", "who're", "who's", "who've", "why'll", "why're", "why's", "won't", "would've", "wouldn't", "wouldn't've", "y'all", "y'all'd've", "you'd", "you'd've", "you'll", "you're", "you've"];

const contractionMap = contractions.reduce((acc, word) => {
  acc[word.replace(/'.*/, '')] = true;
  return acc;
}, {});

const alternatesTable = {};

/**
 * This method mimics Observable.fromEvent, but with capture semantics.
 */
function fromEventCapture(element, name) {
  return _Observable.Observable.create(subj => {
    const handler = function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (args.length > 1) {
        subj.next(args);
      } else {
        subj.next(args[0] || true);
      }
    };

    element.addEventListener(name, handler, true);
    return new _Subscription.Subscription(() => element.removeEventListener(name, handler, true));
  });
}

/**
 * SpellCheckHandler is the main class of this library, and handles all of the
 * different pieces of spell checking except for the context menu information.
 *
 * Instantiate the class, then call {{attachToInput}} to wire it up. The spell
 * checker will attempt to automatically check the language that the user is
 * typing in and switch on-the fly. However, giving it an explicit hint by
 * calling {{switchLanguage}}, or providing it a block of sample text via
 * {{provideHintText}} will result in much better results.
 *
 * Sample text should be text that is reasonably likely to be in the same language
 * as the user typing - for example, in an Email reply box, the original Email text
 * would be a great sample, or in the case of Slack, the existing channel messages
 * are used as the sample text.
 */
class SpellCheckHandler {
  /**
   * Constructs a SpellCheckHandler
   *
   * @param  {DictionarySync} dictionarySync  An instance of {{DictionarySync}},
   *                                          create a custom one if you want
   *                                          to override the dictionary cache
   *                                          location.
   * @param  {LocalStorage} localStorage      Deprecated.
   * @param  {Scheduler} scheduler            The Rx scheduler to use, for
   *                                          testing.
   */
  constructor() {
    let dictionarySync = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    let localStorage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    let scheduler = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    // NB: Require here so that consumers can handle native module exceptions.
    Spellchecker = require('./node-spellchecker').Spellchecker;

    this.dictionarySync = dictionarySync || new _dictionarySync2.default();
    this.switchToLanguage = new _Subject.Subject();
    this.currentSpellchecker = null;
    this.currentSpellcheckerLanguage = null;
    this.currentSpellcheckerChanged = new _Subject.Subject();
    this.spellCheckInvoked = new _Subject.Subject();
    this.spellingErrorOccurred = new _Subject.Subject();
    this.isMisspelledCache = new _lruCache2.default({
      max: 512, maxAge: 4 * 1000
    });

    this.scheduler = scheduler;
    this.shouldAutoCorrect = true;
    this._automaticallyIdentifyLanguages = true;

    this.disp = new _rxjsSerialSubscription2.default();

    if (isMac) {
      // NB: OS X does automatic language detection, we're gonna trust it
      this.currentSpellchecker = new Spellchecker();
      this.currentSpellcheckerLanguage = 'en-US';

      if (webFrame) {
        webFrame.setSpellCheckProvider(this.currentSpellcheckerLanguage, this.shouldAutoCorrect, { spellCheck: this.handleElectronSpellCheck.bind(this) });
      }
      return;
    }
  }

  /**
   * Is the spellchecker trying to detect the typed language automatically?
   */
  get automaticallyIdentifyLanguages() {
    return this._automaticallyIdentifyLanguages;
  }

  /**
   * Is the spellchecker trying to detect the typed language automatically?
   */
  set automaticallyIdentifyLanguages(value) {
    this._automaticallyIdentifyLanguages = !!value;

    // Calling `setDictionary` on the macOS implementation of `@paulcbetts/spellchecker`
    // is the only way to set the `automaticallyIdentifyLanguages` property on the
    // native NSSpellchecker. Calling switchLanguage with a language will set it `false`,
    // while calling it with an empty language will set it to `true`
    if (isMac && !!value) {
      this.switchLanguage();
    } else if (isMac && !!value && this.currentSpellcheckerLanguage) {
      this.switchLanguage(this.currentSpellcheckerLanguage);
    }
  }

  /**
   * Disconnect the events that we connected in {{attachToInput}} or other places
   * in the class.
   */
  unsubscribe() {
    this.disp.unsubscribe();
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
   * Attach to document.body and register ourselves for Electron spell checking.
   * This method will start to watch text entered by the user and automatically
   * switch languages as well as enable Electron spell checking (i.e. the red
   * squigglies).
   *
   * @param  {Observable<String>} inputText     Simulate the user typing text,
   *                                            for testing.
   *
   * @return {Disposable}       A Disposable which will unregister all of the
   *                            things that this method registered.
   */
  attachToInput() {
    var _this = this;

    let inputText = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    // OS X has no need for any of this
    if (isMac && !inputText) {
      return _Subscription.Subscription.EMPTY;
    }

    let possiblySwitchedCharacterSets = new _Subject.Subject();
    let wordsTyped = 0;

    if (!inputText && !document.body) {
      throw new Error("document.body is null, if you're calling this in a preload script you need to wrap it in a setTimeout");
    }

    let input = inputText || fromEventCapture(document.body, 'input').mergeMap(e => {
      if (!e.target || !e.target.value) return _Observable.Observable.empty();
      if (e.target.value.match(/\S\s$/)) {
        wordsTyped++;
      }

      if (wordsTyped > 2) {
        d(`${wordsTyped} words typed without spell checking invoked, redetecting language`);
        possiblySwitchedCharacterSets.next(true);
      }

      return _Observable.Observable.of(e.target.value);
    });

    let disp = new _Subscription.Subscription();

    // NB: When users switch character sets (i.e. we're checking in English and
    // the user suddenly starts typing in Russian), the spellchecker will no
    // longer invoke us, so we don't have a chance to re-detect the language.
    //
    // If we see too many words typed without a spelling detection, we know we
    // should start rechecking the input box for a language change.
    disp.add(_Observable.Observable.merge(this.spellCheckInvoked, this.currentSpellcheckerChanged).subscribe(() => wordsTyped = 0));

    let lastInputText = '';
    disp.add(input.subscribe(x => lastInputText = x));

    let initialInputText = input.guaranteedThrottle(250, this.scheduler).takeUntil(this.currentSpellcheckerChanged);

    if (this.currentSpellcheckerLanguage) {
      initialInputText = _Observable.Observable.empty();
    }

    let contentToCheck = _Observable.Observable.merge(this.spellingErrorOccurred, initialInputText, possiblySwitchedCharacterSets).mergeMap(() => {
      if (lastInputText.length < 8) return _Observable.Observable.empty();
      return _Observable.Observable.of(lastInputText);
    });

    let languageDetectionMatches = contentToCheck.filter(() => this.automaticallyIdentifyLanguages).mergeMap(text => {
      d(`Attempting detection, string length: ${text.length}`);
      if (text.length > 256) {
        text = text.substr(text.length - 256);
      }

      return _Observable.Observable.fromPromise(this.detectLanguageForText(text)).catch(() => _Observable.Observable.empty());
    });

    disp.add(languageDetectionMatches.mergeMap((() => {
      var _ref = _asyncToGenerator(function* (langWithoutLocale) {
        d(`Auto-detected language as ${langWithoutLocale}`);
        let lang = yield _this.getLikelyLocaleForLanguage(langWithoutLocale);
        if (lang !== _this.currentSpellcheckerLanguage) yield _this.switchLanguage(lang);

        return lang;
      });

      return function (_x5) {
        return _ref.apply(this, arguments);
      };
    })()).catch(e => {
      d(`Failed to load dictionary: ${e.message}`);
      return _Observable.Observable.empty();
    }).subscribe((() => {
      var _ref2 = _asyncToGenerator(function* (lang) {
        d(`New Language is ${lang}`);
      });

      return function (_x6) {
        return _ref2.apply(this, arguments);
      };
    })()));

    if (webFrame) {
      let prevSpellCheckLanguage;

      disp.add(this.currentSpellcheckerChanged.startWith(true).filter(() => this.currentSpellcheckerLanguage).subscribe(() => {
        if (prevSpellCheckLanguage === this.currentSpellcheckerLanguage) return;

        d('Actually installing spell check provider to Electron');
        webFrame.setSpellCheckProvider(this.currentSpellcheckerLanguage, this.shouldAutoCorrect, { spellCheck: this.handleElectronSpellCheck.bind(this) });

        prevSpellCheckLanguage = this.currentSpellcheckerLanguage;
      }));
    }

    this.disp.add(disp);
    return disp;
  }

  /**
   * autoUnloadDictionariesOnBlur attempts to save memory by unloading
   * dictionaries when the window loses focus.
   *
   * @return {Disposable}   A {{Disposable}} that will unhook the events listened
   *                        to by this method.
   */
  autoUnloadDictionariesOnBlur() {
    let ret = new _Subscription.Subscription();
    let hasUnloaded = false;

    if (isMac) return _Subscription.Subscription.EMPTY;

    ret.add(_Observable.Observable.fromEvent(window, 'blur').subscribe(() => {
      d(`Unloading spellchecker`);
      this.currentSpellchecker = null;
      hasUnloaded = true;
    }));

    ret.add(_Observable.Observable.fromEvent(window, 'focus').mergeMap(() => {
      if (!hasUnloaded) return _Observable.Observable.empty();
      if (!this.currentSpellcheckerLanguage) return _Observable.Observable.empty();

      d(`Restoring spellchecker`);
      return _Observable.Observable.fromPromise(this.switchLanguage(this.currentSpellcheckerLanguage)).catch(e => {
        d(`Failed to restore spellchecker: ${e.message}`);
        return _Observable.Observable.empty();
      });
    }).subscribe());

    return ret;
  }

  /**
   * Switch the dictionary language to the language of the sample text provided.
   * As described in the class documentation, call this method with text most
   * likely in the same language as the user is typing. The locale (i.e. *US* vs
   * *UK* vs *AU*) will be inferred heuristically based on the user's computer.
   *
   * @param  {String} inputText   A language code (i.e. 'en-US')
   *
   * @return {Promise}            Completion
   */
  provideHintText(inputText) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      let langWithoutLocale = null;
      if (isMac) return;

      try {
        langWithoutLocale = yield _this2.detectLanguageForText(inputText.substring(0, 512));
      } catch (e) {
        d(`Couldn't detect language for text of length '${inputText.length}': ${e.message}, ignoring sample`);
        return;
      }

      let lang = yield _this2.getLikelyLocaleForLanguage(langWithoutLocale);
      yield _this2.switchLanguage(lang);
    })();
  }

  /**
   * Explicitly switch the language to a specific language. This method will
   * automatically download the dictionary for the specific language and locale
   * and on failure, will attempt to switch to dictionaries that are the same
   * language but a default locale.
   *
   * @param  {String} langCode    A language code (i.e. 'en-US')
   *
   * @return {Promise}            Completion
   */
  switchLanguage(langCode) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      let actualLang;
      let dict = null;

      // Set language on macOS
      if (isMac && _this3.currentSpellchecker) {
        d(`Setting current spellchecker to ${langCode}`);
        _this3.currentSpellcheckerLanguage = langCode;
        return _this3.currentSpellchecker.setDictionary(langCode);
      }

      // Set language on Linux & Windows (Hunspell)
      _this3.isMisspelledCache.reset();

      try {
        var _ref3 = yield _this3.loadDictionaryForLanguageWithAlternatives(langCode);

        const dictionary = _ref3.dictionary,
              language = _ref3.language;

        actualLang = language;dict = dictionary;
      } catch (e) {
        d(`Failed to load dictionary ${langCode}: ${e.message}`);
        throw e;
      }

      if (!dict) {
        d(`dictionary for ${langCode}_${actualLang} is not available`);
        _this3.currentSpellcheckerLanguage = actualLang;
        _this3.currentSpellchecker = null;
        _this3.currentSpellcheckerChanged.next(true);
        return;
      }

      d(`Setting current spellchecker to ${actualLang}, requested language was ${langCode}`);
      if (_this3.currentSpellcheckerLanguage !== actualLang || !_this3.currentSpellchecker) {
        d(`Creating node-spellchecker instance`);

        _this3.currentSpellchecker = new Spellchecker();
        _this3.currentSpellchecker.setDictionary(actualLang, dict);
        _this3.currentSpellcheckerLanguage = actualLang;
        _this3.currentSpellcheckerChanged.next(true);
      }
    })();
  }

  /**
   * Loads a dictionary and attempts to use fallbacks if it fails.
   * @private
   */
  loadDictionaryForLanguageWithAlternatives(langCode) {
    var _this4 = this;

    let cacheOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    return _asyncToGenerator(function* () {
      _this4.fallbackLocaleTable = _this4.fallbackLocaleTable || require('./fallback-locales');
      let lang = langCode.split(/[-_]/)[0];

      let alternatives = [langCode, yield _this4.getLikelyLocaleForLanguage(lang), _this4.fallbackLocaleTable[lang]];
      if (langCode in alternatesTable) {
        try {
          return {
            language: alternatesTable[langCode],
            dictionary: yield _this4.dictionarySync.loadDictionaryForLanguage(alternatesTable[langCode])
          };
        } catch (e) {
          d(`Failed to load language ${langCode}, altTable=${alternatesTable[langCode]}`);
          delete alternatesTable[langCode];
        }
      }

      d(`Requesting to load ${langCode}, alternatives are ${JSON.stringify(alternatives)}`);
      return yield _Observable.Observable.of(...alternatives).concatMap(function (l) {
        return _Observable.Observable.defer(function () {
          return _Observable.Observable.fromPromise(_this4.dictionarySync.loadDictionaryForLanguage(l, cacheOnly));
        }).map(function (d) {
          return { language: l, dictionary: d };
        }).do(function (_ref4) {
          let language = _ref4.language;

          alternatesTable[langCode] = language;
        }).catch(function () {
          return _Observable.Observable.of(null);
        });
      }).concat(_Observable.Observable.of({ language: langCode, dictionary: null })).filter(function (x) {
        return x !== null;
      }).take(1).toPromise();
    })();
  }

  /**
   *  The actual callout called by Electron to handle spellchecking
   *  @private
   */
  handleElectronSpellCheck(text) {
    if (!this.currentSpellchecker) return true;

    if (isMac) {
      return !this.isMisspelled(text);
    }

    this.spellCheckInvoked.next(true);

    let result = this.isMisspelled(text);
    if (result) this.spellingErrorOccurred.next(text);
    return !result;
  }

  /**
   * Calculates whether a word is missspelled, using an LRU cache to memoize
   * the callout to the actual spell check code.
   *
   * @private
   */
  isMisspelled(text) {
    let result = this.isMisspelledCache.get(text);
    if (result !== undefined) {
      return result;
    }

    result = (() => {
      if (contractionMap[text.toLocaleLowerCase()]) {
        return false;
      }

      if (!this.currentSpellchecker) return false;

      if (isMac) {
        return this.currentSpellchecker.isMisspelled(text);
      }

      // NB: I'm not smart enough to fix this bug in Chromium's version of
      // Hunspell so I'm going to fix it here instead. Chromium Hunspell for
      // whatever reason marks the first word in a sentence as mispelled if it is
      // capitalized.
      result = this.currentSpellchecker.checkSpelling(text);
      if (result.length < 1) {
        return false;
      }

      if (result[0].start !== 0) {
        // If we're not at the beginning, we know it's not a false positive
        return true;
      }

      // Retry with lowercase
      return this.currentSpellchecker.isMisspelled(text.toLocaleLowerCase());
    })();

    this.isMisspelledCache.set(text, result);
    return result;
  }

  /**
   * Calls out to cld2 to detect the language of the given text
   * @private
   */
  detectLanguageForText(text) {
    return new Promise((res, rej) => {
      setTimeout(() => cld.detect(text).then(res, rej), 10);
    });
  }

  /**
   * Returns the locale for a language code based on the user's machine (i.e.
   * 'en' => 'en-GB')
   */
  getLikelyLocaleForLanguage(language) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      let lang = language.toLowerCase();
      if (!_this5.likelyLocaleTable) _this5.likelyLocaleTable = yield _this5.buildLikelyLocaleTable();

      if (_this5.likelyLocaleTable[lang]) return _this5.likelyLocaleTable[lang];
      _this5.fallbackLocaleTable = _this5.fallbackLocaleTable || require('./fallback-locales');

      return _this5.fallbackLocaleTable[lang];
    })();
  }

  /**
   * A proxy for the current spellchecker's method of the same name
   * @private
   */
  getCorrectionsForMisspelling(text) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      // NB: This is async even though we don't use await, to make it easy for
      // ContextMenuBuilder to use this method even when it's hosted in another
      // renderer process via electron-remote.
      if (!_this6.currentSpellchecker) {
        return null;
      }

      return _this6.currentSpellchecker.getCorrectionsForMisspelling(text);
    })();
  }

  /**
   * A proxy for the current spellchecker's method of the same name
   * @private
   */
  addToDictionary(text) {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      // NB: Same deal as getCorrectionsForMisspelling.
      if (!isMac) return;
      if (!_this7.currentSpellchecker) return;

      _this7.currentSpellchecker.add(text);
    })();
  }

  /**
   * Call out to the OS to figure out what locales the user is probably
   * interested in then save it off as a table.
   * @private
   */
  buildLikelyLocaleTable() {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      let localeList = [];

      if (process.platform === 'linux') {
        let locales = yield (0, _spawnRx.spawn)('locale', ['-a']).catch(function () {
          return _Observable.Observable.of(null);
        }).reduce(function (acc, x) {
          acc.push(...x.split('\n'));return acc;
        }, []).toPromise();

        d(`Raw Locale list: ${JSON.stringify(locales)}`);

        localeList = locales.reduce(function (acc, x) {
          let m = x.match(validLangCodeWindowsLinux);
          if (!m) return acc;

          acc.push(m[0]);
          return acc;
        }, []);
      }

      if (process.platform === 'win32') {
        localeList = require('keyboard-layout').getInstalledKeyboardLanguages();
      }

      if (isMac) {
        fallbackLocaleTable = fallbackLocaleTable || require('./fallback-locales');

        // NB: OS X will return lists that are half just a language, half
        // language + locale, like ['en', 'pt_BR', 'ko']
        localeList = _this8.currentSpellchecker.getAvailableDictionaries().map(function (x) {
          if (x.length === 2) return fallbackLocaleTable[x];
          return (0, _utility.normalizeLanguageCode)(x);
        });
      }

      d(`Filtered Locale list: ${JSON.stringify(localeList)}`);

      // Some distros like Ubuntu make locale -a useless by dumping
      // every possible locale for the language into the list :-/
      let counts = localeList.reduce(function (acc, x) {
        let k = x.split(/[-_\.]/)[0];
        acc[k] = acc[k] || [];
        acc[k].push(x);

        return acc;
      }, {});

      d(`Counts: ${JSON.stringify(counts)}`);

      let ret = Object.keys(counts).reduce(function (acc, x) {
        if (counts[x].length > 1) return acc;

        d(`Setting ${x}`);
        acc[x] = (0, _utility.normalizeLanguageCode)(counts[x][0]);

        return acc;
      }, {});

      // NB: LANG has a Special Place In Our Hearts
      if (process.platform === 'linux' && process.env.LANG) {
        let m = process.env.LANG.match(validLangCodeWindowsLinux);
        if (!m) return ret;

        ret[m[0].split(/[-_\.]/)[0]] = (0, _utility.normalizeLanguageCode)(m[0]);
      }

      d(`Result: ${JSON.stringify(ret)}`);
      return ret;
    })();
  }
}
exports.default = SpellCheckHandler;