var GLOBAL = global || this;
var EventPublisher = require('../../src/core/event.js').EventPublisher;

describe('EventPublisher', function() {

  it('reports hasListeners correctly for no listeners, ever', function() {
    var ep = new EventPublisher;
    expect(ep.hasListeners()).toBe(false);
  });

  it('reports hasListeners correctly for no listeners after removing them', function() {
    var ep = new EventPublisher;
    ep.subs = {}; // listeners might have been there, but removed.
    expect(ep.hasListeners()).toBe(false);
  });

  it('reports hasListeners correctly for one listener', function() {
    var ep = new EventPublisher;
    ep.subs = { null: ['myFakeListener'] };
    expect(ep.hasListeners()).toBe(true);
  });

  it('reports hasListeners correctly for a specific listener', function() {
    var ep = new EventPublisher;
    ep.subs = { 'cake': { null: ['myFakeListener'] } };
    expect(ep.hasListeners(['cake'])).toBe(true);
  });

  it('reports hasListeners correctly and ignores a specific listener', function() {
    var ep = new EventPublisher;
    ep.subs = { 'cake': { null: ['myFakeListener'] } };
    expect(ep.hasListeners(['lie'])).toBe(false);
  });

});
