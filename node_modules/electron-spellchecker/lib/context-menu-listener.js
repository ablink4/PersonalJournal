'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _electron = require('electron');

var _Observable = require('rxjs/Observable');

var _Subscription = require('rxjs/Subscription');

var _electronRemote = require('electron-remote');

require('rxjs/add/observable/fromEvent');

require('rxjs/add/operator/map');

let d = require('debug')('electron-spellchecker:context-menu-listener');

/**
 * ContextMenuListener will listen to the given window / WebView control and
 * invoke a handler function. This function usually will immediately turn around
 * and invoke {{showPopupMenu}} from {{ContextMenuBuilder}}.
 */
class ContextMenuListener {
  /**
   * Constructs a ContextMenuListener and wires up the events it needs to fire
   * the callback.
   *
   * @param  {Function} handler             The callback that will be invoked
   *                                        with the 'context-menu' info.
   * @param  {BrowserWindow|WebView} windowOrWebView  The target, either a
   *                                                  BrowserWindow or a WebView
   * @param  {Observable<Object>} contextMenuEvent  Use this for simulating a
   *                                                ContextMenu event
   */
  constructor(handler) {
    let windowOrWebView = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    let contextMenuEvent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    this.sub = new _Subscription.Subscription();

    if (!contextMenuEvent) {
      windowOrWebView = windowOrWebView || _electron.remote.getCurrentWebContents();
      contextMenuEvent = (0, _electronRemote.fromRemoteWindow)(windowOrWebView, 'context-menu', true).map((_ref) => {
        var _ref2 = _slicedToArray(_ref, 1);

        let x = _ref2[0];
        return x[1];
      });
    }

    this.sub.add(contextMenuEvent.subscribe(handler));
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
   * Disconnect the events that we connected in the Constructor
   */
  unsubscribe() {
    this.sub.unsubscribe();
  }
}
exports.default = ContextMenuListener;