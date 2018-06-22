'use strict';

var _Observable = require('rxjs/Observable');

require('rxjs/add/observable/timer');

require('rxjs/add/operator/map');

require('rxjs/add/operator/switch');

const newCoolOperators = {
  guaranteedThrottle: function (time) {
    let scheduler = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    return this.map(x => _Observable.Observable.timer(time, scheduler).map(() => x)).switch();
  }
};

for (let key of Object.keys(newCoolOperators)) {
  _Observable.Observable.prototype[key] = newCoolOperators[key];
}