/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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

if ( foam.isServer ) {
  performance = {
    now: require('present')
  };

  require('../../../../src/core/tracing/Untraceable.js');
  require('../../../../src/core/tracing/Event.js');
  require('../../../../src/core/tracing/Publication.js');
  require('../../../../src/core/tracing/Notification.js');
  require('../../../../src/core/tracing/Window.js');
  require('../../../../src/core/tracing/FObject.js');
  require('../../../../src/core/tracing/EventNode.js');
  require('../../../../src/core/tracing/EventDAO.js');
  require('../../../../src/core/tracing/Tracer.js');
}

describe('Tracing', function() {
  var M = foam.lookup('foam.mlang.Expressions').create();
  var Tracer = foam.lookup('foam.core.tracing.Tracer');
  var Event = foam.lookup('foam.core.tracing.Event');
  var Publication = foam.lookup('foam.core.tracing.Publication');
  var Notification = foam.lookup('foam.core.tracing.Notification');

  // Tests are expected to add any tracers to be cleaned up to this array.
  var tracers;

  foam.CLASS({
    package: 'test.tracing',
    name: 'PropertyIsInstance',
    extends: 'foam.mlang.predicate.Expr',

    properties: [
      {
        name: 'model',
        value: { isInstance: function() { return false; } }
      },
      {
        name: 'prop',
        value: { f: function() { return false; } }
      }
    ],

    methods: [
      function f(object) {
        return this.model.isInstance(this.prop.f(object));
      },
      function toString() {
        return 'PROPERTY_IS_INSTANCE(' + this.model.id + ', ' +
          this.prop.name + ')';
      }
    ]
  });
  var PropertyIsInstance = foam.lookup('test.tracing.PropertyIsInstance');
  var PROPERTY_IS_INSTANCE = function(model, prop) {
    return PropertyIsInstance.create({ model: model, prop: prop });
  };
  foam.CLASS({
    package: 'test.tracing',
    name: 'Base',
    properties: [ 'id', 'base' ]
  });

  beforeEach(function() {
    tracers = [];

  });
  afterEach(function() {
    if ( tracers ) {
      tracers.forEach(function(tracer) { tracer.disable(); });
    }
  });

  it('Enable/disable tracer test', function() {
    var events = [];
    var base = foam.lookup('test.tracing.Base').create({id: 1, base: ''});
    var tracer = Tracer.create({
      dao: { put: function put(event) {
        events.push(event);
      } }
    });
    tracers.push(tracer);
    expect(tracer.enabled).toBe(true);
    base.base = 'base';
    tracer.disable();
    var events2 = Array.from(events);
    base.base = 'base2';
    expect(events).toEqual(events2);
    tracer.enable();
    base.base = 'base3';
    expect(events.length).toBeGreaterThan(events2.length);
  });
  it('Filtered tracer test', function() {
    foam.CLASS({
      package: 'test.tracing',
      name: 'FilterA',
      extends: 'test.tracing.Base',
      properties: [ 'a' ]
    });
    foam.CLASS({
      package: 'test.tracing',
      name: 'FilterB',
      extends: 'test.tracing.Base',
      properties: [ 'a', 'b' ]
    });
    foam.CLASS({
      package: 'test.tracing',
      name: 'FilterOther',
      properties: [ 'id', 'other' ]
    });
    var a = foam.lookup('test.tracing.FilterA').create({id: 4, a:1});
    var b = foam.lookup('test.tracing.FilterB').create({id: 8, b:6});
    var other = foam.lookup('test.tracing.FilterOther').create({id: 16, other:''});

    var events = [];
    var tracer = Tracer.create({
      predicate: PROPERTY_IS_INSTANCE(foam.lookup('test.tracing.Base'),
                                      Publication.PUBLISHER),
      dao: { put: function put(event) {
        events.push(event);
      } }
    });
    tracers.push(tracer);

    expect(a.a).not.toBe('foo');
    a.a = 'foo';
    expect(b.b).not.toBe(true);
    b.b = true;
    expect(other.other).not.toBe('other');
    other.other = 'other';

    expect(events.length).toBe(2);
    expect(events[0].publisher).toBe(a); // Property change: a.a.
    expect(events[1].publisher).toBe(b); // Property change: b.b.
  });
  it('Framed listener test', function(done) {
    var events = [];
    var a, b;

    foam.CLASS({
      package: 'test.tracing',
      name: 'FramedA',
      extends: 'test.tracing.Base',
      properties: [ 'a' ]
    });
    foam.CLASS({
      package: 'test.tracing',
      name: 'FramedB',
      extends: 'test.tracing.Base',
      properties: [ 'a' ],
      methods: [
        function init() {
          this.SUPER();
          this.a.a$.sub(this.l);
        }
      ],
      listeners: [
        {
          name: 'l',
          isFramed: true,
          code: function() {
            expect(events.length).toBe(2); // [ Publication, Notification ].
            // Notification now traced.
            expect(Notification.isInstance(events[1])).toBe(true);
            expect(events[1].publisher).toBe(a);
            expect(events[1].subscriber).toBe(b);
            expect(events[1].listener).toBe(arguments.callee);
            // slice(1) below: Don't care about subscription object.
            expect(events[1].args.slice(1)).toEqual(['propertyChange', 'a', a.a$]);
            done();
          }
        }
      ]
    });

    a = foam.lookup('test.tracing.FramedA').create({id: 4, a: 1});
    b = foam.lookup('test.tracing.FramedB').create({id: 8, a: a});

    var tracer = Tracer.create({
      predicate: PROPERTY_IS_INSTANCE(foam.lookup('test.tracing.Base'),
                                      Publication.PUBLISHER),
      dao: { put: function put(event) {
        events.push(event);
      } }
    });
    tracers.push(tracer);

    expect(events.length).toBe(0);
    a.a = 2;
    // Publication, not notification traced.
    expect(events.length).toBe(1);
    expect(Publication.isInstance(events[0])).toBe(true);
    expect(events[0].publisher).toBe(a);
    expect(events[0].args).toEqual(['propertyChange', 'a', a.a$]);
  });
});
