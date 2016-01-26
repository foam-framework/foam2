var GLOBAL = global || this;
var _events = require('../../src/core/event.js');
var EventPublisher = _events.EventPublisher;
var EventService = _events.EventService;

describe('EventPublisher', function() {

  it('reports hasListeners correctly for no listeners, ever', function() {
    var ep = Object.create(EventPublisher);
    expect(ep.subs_).toBeNull();
    expect(ep.hasListeners()).toBe(false);
  });

  it('reports hasListeners correctly for no listeners after removing them', function() {
    var ep = Object.create(EventPublisher);
    ep.subs_ = {}; // listeners might have been there, but removed.
    expect(ep.hasListeners()).toBe(false);
  });

  it('reports hasListeners correctly for one listener', function() {
    var ep = Object.create(EventPublisher);
    ep.subs_ = { null: ['myFakeListener'] };
    expect(ep.hasListeners()).toBe(true);
  });

  it('reports hasListeners correctly for an empty listener list', function() {
    var ep = Object.create(EventPublisher);
    ep.subs_ = { null: [] };
    expect(ep.hasListeners()).toBe(false);
  });

  it('reports hasListeners correctly for a specific listener', function() {
    var ep = Object.create(EventPublisher);
    ep.subs_ = { 'cake': { null: ['myFakeListener'] } };
    expect(ep.hasListeners(['cake'])).toBe(true);
  });

  it('reports hasListeners correctly and ignores a specific listener', function() {
    var ep = Object.create(EventPublisher);
    ep.subs_ = { 'cake': { null: ['myFakeListener'] } };
    expect(ep.hasListeners(['lie'])).toBe(false);
  });

  it('reports hasListeners correctly for a multi-level topic with a listener', function() {
    var ep = Object.create(EventPublisher);
    ep.subs_ = { 'the' : { 'cake': { 'is' : { null: ['myFakeListener'] } } } };
    expect(ep.hasListeners(['the','cake','is'])).toBe(true);
  });

  it('reports hasListeners correctly for a multi-level topic with no listener', function() {
    var ep = Object.create(EventPublisher);
    ep.subs_ = { 'the' : { 'cake': { 'is' : { null: ['myFakeListener'] } } } };
    expect(ep.hasListeners(['the','cake'])).toBe(false);
  });

  it('reports hasListeners correctly for a multi-level topic that is complete but empty listener list', function() {
    var ep = Object.create(EventPublisher);
    ep.subs_ = { 'the' : { 'cake': { 'is' : { null: [] } } } };
    expect(ep.hasListeners(['the','cake', 'is'])).toBe(false);
  });

  it('reports hasListeners correctly for a multi-level topic with a wildcard', function() {
    var ep = Object.create(EventPublisher);
    ep.subs_ = { 'the' : { 'cake': { 'is' : { null: ['myFakeListener'] } } } };
    expect(ep.hasListeners(['the', EventService.WILDCARD])).toBe(true);
  });

  it('reports hasListeners correctly for a root level wildcard', function() {
    var ep = Object.create(EventPublisher);
    ep.subs_ = { 'the' : { 'cake': { 'is' : { null: ['myFakeListener'] } } } };
    expect(ep.hasListeners([EventService.WILDCARD])).toBe(true);
  });

  it('reports hasListeners correctly for a given topic but no listeners', function() {
    var ep = Object.create(EventPublisher);
    expect(ep.hasListeners([EventService.WILDCARD])).toBe(false);
  });

});
