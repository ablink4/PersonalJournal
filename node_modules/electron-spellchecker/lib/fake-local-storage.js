"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
class FakeLocalStorage {
  constructor() {
    this.ls = {};
  }

  getItem(item) {
    return this.ls[item];
  }

  setItem(item, val) {
    this.ls[item] = val;
  }
}
exports.default = FakeLocalStorage;