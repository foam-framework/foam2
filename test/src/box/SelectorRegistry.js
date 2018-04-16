/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

describe('selector registry', function() {
  var MockBox;
  var MockBox2;
  var MockRegistry;
  var ClsRegistrySelector;
  var SelectorRegistry;
  var Context;
  var Message;
  var NamedBox;
  var setInterval;
  var clearInterval;

  beforeAll(function() {
    var timers = require('timers');
    setInterval = timers.setInterval;
    clearInterval = timers.clearInterval;
  });

  beforeEach(function() {
    foam.CLASS({
      package: 'foam.box.test',
      name: 'MockBox',
      implements: [ 'foam.box.Box' ],

      properties: [
        {
          class: 'Array',
          of: 'foam.box.Message',
          name: 'messages'
        }
      ],

      methods: [
        function send(message) {
          this.messages.push(message);
        }
      ]
    });
    foam.CLASS({
      package: 'foam.box.test',
      name: 'MockBox2',
      extends: 'foam.box.test.MockBox'
    });

    foam.CLASS({
      package: 'foam.box.test',
      name: 'MockRegistry',
      extends: 'foam.box.BoxRegistryBox',


      properties: [
        {
          class: 'String',
          name: 'name'
        },
        {
          class: 'Array',
          of: 'Object',
          name: 'actions'
        }
      ],

      methods: [
        function register(name, service, box) {
          this.actions.push({
            action: 'register',
            name: name,
            service: service,
            box: box
          });
          return this.SUPER(name, service, box);
        },
        function unregister(name) {
          this.actions.push({
            action: 'unregister',
            name: name
          });
          this.SUPER(name);
        }
      ]
    });

    foam.CLASS({
      package: 'foam.box.test',
      name: 'ClsRegistrySelector',
      implements: [ 'foam.box.RegistrySelector' ],

      requires: [ 'foam.box.test.MockRegistry' ],

      properties: [
        {
          name: 'registries',
          factory: function() { return {}; }
        }
      ],

      methods: [
        function select(name, service, box) {
          var clsId = box.cls_.id;
          if ( ! this.registries[clsId] ) {
            var ctx = Context.create({
              myname: '/' + clsId.replace(/[.]/g, '/')
            });
            var registry = this.MockRegistry.create({
              name: clsId
            }, ctx);
            ctx.registry = registry;
            this.registries[clsId] = registry;
          }
          return this.registries[clsId];
        }
      ]
    });

    MockBox = foam.lookup('foam.box.test.MockBox');
    MockBox2 = foam.lookup('foam.box.test.MockBox2');
    MockRegistry = foam.lookup('foam.box.test.MockRegistry');
    ClsRegistrySelector = foam.lookup('foam.box.test.ClsRegistrySelector');
    SelectorRegistry = foam.lookup('foam.box.SelectorRegistry');
    Context = foam.lookup('foam.box.Context');
    Message = foam.lookup('foam.box.Message');
    NamedBox = foam.lookup('foam.box.NamedBox');
  });

  it('should follow provided class-based registration strategy', function() {
    var ctx = Context.create();
    var selector = ClsRegistrySelector.create(null, ctx);
    var registry = SelectorRegistry.create({
      selector: selector
    }, ctx);
    ctx.registry = registry;

    var foo = MockBox.create();
    var bar = MockBox.create();
    var baz = MockBox2.create();
    ctx.registry.register('foo', null, foo);
    ctx.registry.register('bar', null, bar);
    ctx.registry.register('baz', null, baz);

    expect(Object.keys(selector.registries).length).toBe(2);
    expect(selector.registries['foam.box.test.MockBox']).toBeDefined();
    expect(selector.registries['foam.box.test.MockBox2']).toBeDefined();
    var mockBoxRegistry = selector.registries['foam.box.test.MockBox'];
    // Note: Names are set to a random GUID in delegate register action.
    // Correct routing by name is tested in other tests.
    mockBoxRegistry.actions = mockBoxRegistry.actions.map(function(action) {
      action.name = null;
      return action;
    });
    expect(mockBoxRegistry.actions).toEqual([
      { action: 'register', name: null, service: null, box: foo },
      { action: 'register', name: null, service: null, box: bar }
    ]);
    var mockBox2Registry = selector.registries['foam.box.test.MockBox2'];
    mockBox2Registry.actions = mockBox2Registry.actions.map(function(action) {
      action.name = null;
      return action;
    });
    expect(mockBox2Registry.actions).toEqual([
      { action: 'register', name: null, service: null, box: baz }
    ]);
  });

  it('should forward messages to registered box', function() {
    var ctx = Context.create();
    var selector = ClsRegistrySelector.create(null, ctx);
    var registry = SelectorRegistry.create({
      selector: selector
    }, ctx);
    ctx.registry = registry;

    var foo = MockBox.create();
    var registeredFoo = ctx.registry.register('foo', null, foo);
    var message = Message.create({
      object: 'Hello world'
    });
    registeredFoo.send(message);
    expect(foo.messages.length).toBe(1);
    expect(foo.messages[0].equals(message)).toBe(true);
  });

  it('should forward messages to appropriate NamedBox', function(done) {
    var ctx = Context.create();
    var selector = ClsRegistrySelector.create(null, ctx);
    var registry = SelectorRegistry.create({
      selector: selector
    }, ctx);
    ctx.registry = registry;

    var foo = MockBox.create();
    var registeredFoo = ctx.registry.register('foo', null, foo);
    var message = Message.create({
      object: 'Hello world'
    });

    NamedBox.create({ name: `${ctx.myname}/foo` }, ctx).send(message);

    // Poll for expectation; NamedBox lookup will lead to PromisedBoxes that
    // delay sending of message to final destination.
    //
    // TODO(markdittmer): Find a more robust mechanism to get around
    // PromisedBoxes here.
    var tries = 0;
    var interval = 10;
    var maxTries = 10;
    var intervalId;
    function checkValues() {
      return foo.messages.length === 1 &&
          foo.messages[0].equals(message) === true;
    }
    function checkMessages() {
      tries++;
      var result = checkValues();
      if ( tries >= maxTries || result ) clearInterval(intervalId);
      if ( tries >= maxTries ) {
        expect(foo.messages.length).toBe(1);
        expect(foo.messages[0].equals(message)).toBe(true);
        done.fail();
      }
      if ( result ) {
        expect().nothing();
        done();
      }
    }
    intervalId = setInterval(checkMessages, interval);
  });
});
