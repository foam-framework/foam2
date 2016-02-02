/*

var GLOBAL = global || this;

var corePromise = GLOBAL.loadCoreTo('core/context.js');

describe('ConteXt object', function() {
  beforeEach(function(done) { corePromise.then(done); });

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

  it('Expect set() to place value on context object', function() {
    var X = GLOBAL.X.sub();
    var value = {};
    X.set('value', value);
    expect(X.value).toBe(value);
  });

  it('Expect multi-part path set() to place value on context object',
     function() {
       var X = GLOBAL.X.sub();
       var value = {};
       X.set('v.a.l.u.e', value);
       expect(X.v.a.l.u.e).toBe(value);
     });

  it('Expect multi-part path set() to place value on correct object',
     function() {
       var X = GLOBAL.X.sub();
       var base = {};
       var xtn = {};
       X.set('base', base);
       X.set('base.xtn', xtn);
       expect(X.base).toBe(base);
       expect(base.xtn).toBe(xtn);
     });

  it('Expect bad set() to throw exception', function() {
    var X = GLOBAL.X.sub();
    var value = {};

    var caught = false;
    try {
      X.set('', value);
    } catch (e) { caught = true; }
    expect(caught).toBe(true);

    caught = false;
    try {
      X.set('.', value);
    } catch (e) { caught = true; }
    expect(caught).toBe(true);

    caught = false;
    try {
      X.set('foo..bar', value);
    } catch (e) { caught = true; }
    expect(caught).toBe(true);

    caught = false;
    try {
      X.set('.foo', value);
    } catch (e) { caught = true; }
    expect(caught).toBe(true);

    caught = false;
    try {
      X.set('foo.', value);
    } catch (e) { caught = true; }
    expect(caught).toBe(true);
  });

  it('Expect lookup() to find value', function() {
    var X = GLOBAL.X.sub();
    var value = {};
    X.set('value', value);
    expect(X.lookup('value')).toBe(value);
  });

  it('Expect multi-part path lookup() find value', function() {
    var X = GLOBAL.X.sub();
    var value = {};
    X.set('v.a.l.u.e', value);
    expect(X.lookup('v.a.l.u.e')).toBe(value);
  });

  it('Expect failed lookup() to return undefined', function() {
    var X = GLOBAL.X.sub();
    expect(X.value).toBeUndefined();
    expect(X.val).toBeUndefined();
    expect(X.lookup('value')).toBeUndefined();
    expect(X.lookup('val.ue')).toBeUndefined();
  });

  it('Expect invalid path failed lookup() to throw exception', function() {
    var X = GLOBAL.X.sub();
    var caught = false;
    try {
      X.lookup('');
    } catch (e) { caught = true; }
    expect(caught).toBe(true);

    caught = false;
    try {
      X.lookup('.');
    } catch (e) { caught = true; }
    expect(caught).toBe(true);

    caught = false;
    try {
      X.lookup('.foo');
    } catch (e) { caught = true; }
    expect(caught).toBe(true);

    caught = false;
    try {
      X.lookup('foo.');
    } catch (e) { caught = true; }
    expect(caught).toBe(true);

    caught = false;
    try {
      X.lookup('foo..bar');
    } catch (e) { caught = true; }
    expect(caught).toBe(true);
  });
});
*/