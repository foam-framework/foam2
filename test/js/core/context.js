var GLOBAL = global || this;
require('../../../src/core/context');

describe('ConteXt object', function() {

  it('Expect global context to exist', function() {
    expect(GLOBAL.X).toBeTruthy();
  });

  it('Expect sub() to create empty prototype', function() {
    var Y = GLOBAL.X.sub();
    expect(Object.getPrototypeOf(Y)).toBe(GLOBAL.X);
    expect(Object.getOwnPropertyNames(Y)).toEqual([]);
  });

  it('Expect sub(args) to create appropriate context', function() {
    var newKey = '__new__';
    var newValue = {};
    expect(GLOBAL.X[newKey]).toBeUndefined();
    var args = {};
    args[newKey] = newValue;
    var Y = GLOBAL.X.sub(args);
    expect(GLOBAL.X[newKey]).toBeUndefined();
    expect(Object.getPrototypeOf(Y)).toBe(GLOBAL.X);
    expect(Object.getOwnPropertyNames(Y)).toEqual([newKey]);
    expect(Y[newKey]).toBe(newValue);
  });

  it('Expect sub(args) to only copy top-object keys', function() {
    var hiddenKey = '__hidden__';
    var hiddenValue = {};
    var newKey = '__new__';
    var newValue = {};
    expect(GLOBAL.X[hiddenKey]).toBeUndefined();
    expect(GLOBAL.X[newKey]).toBeUndefined();
    var prototype = {};
    prototype[hiddenKey] = hiddenValue;
    var args = Object.create(prototype);
    args[newKey] = newValue;
    var Y = GLOBAL.X.sub(args);
    expect(GLOBAL.X[hiddenKey]).toBeUndefined();
    expect(GLOBAL.X[newKey]).toBeUndefined();
    expect(Y[hiddenKey]).toBeUndefined();
    expect(Y[newKey]).toBe(newValue);
  });
});
