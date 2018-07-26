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

describe('ConteXt object', function() {
  it('register and lookup', function() {
    expect(foam).toBeTruthy();

    var someClass = {
      id: 'com.acme.Foo'
    };

    var coreClass = {
      package: 'foam.core',
      name: 'Bar',
      id: 'foam.core.Bar'
    };

    foam.register(someClass);
    foam.register(coreClass);

    expect(foam.lookup('com.acme.Foo')).toBe(someClass);
    expect(foam.lookup('Bar')).toBe(coreClass);
  });

  it('createSubContext', function() {
    var named = foam.createSubContext({}, "HELLO");
    var unNamed = named.createSubContext({});

    for ( var key in named ) {
      expect(key).not.toEqual("NAME");
    }

    expect(named.NAME).toEqual("HELLO");
    expect(unNamed.NAME).toEqual("HELLO");

    var foo = {
      id: 'some.packaged.Foo'
    };

    foam.register(foo);

    expect(named.lookup('some.packaged.Foo')).toBe(foo);
  });

  it('subcontexts', function() {
    var sub = foam.createSubContext({ hello: 4 }, 'namey');
    expect(sub.hello).toEqual(4);
  });

  it('subcontexts with dynamic values', function() {
    foam.CLASS({
      name: 'Tester',
      package: 'test',
      properties: [ 'a' ]
    });
    var testa = test.Tester.create({ a: 3 }, foam.__context__);
    var sub = foam.createSubContext({ hello: testa.a$ });

    expect(sub.hello).toEqual(3);
    testa.a = 99;
    expect(sub.hello).toEqual(99);

  });

  it('describes', function() {
    foam.createSubContext({}).describe();
    foam.createSubContext({ hello: 'thing', wee: foam.core.Property.create() }, 'namey').describe();
    expect().nothing();
  });
});

describe('Context Import/Export', function() {
  beforeEach(function() {
    foam.CLASS({
      package: 'test',
      name: 'XUser',
      imports: [
        'bar'
      ],
      methods: [
        function init() {
          this.bar; // triggers a parent context access
        }
      ]
    });
    foam.CLASS({
      package: 'test',
      name: 'ContextBase',
      requires: [
        'test.XUser',
      ],
      exports: [
        'foo',
        'bar',
      ],
      properties: [
        {
          name: 'foo',
          factory: function() {
            return this.XUser.create(undefined, foam.__context__);
          }
        },
        ['bar', 99],
      ],
    });
  });

  it("factories not so lazy that things created in them cause infinite loops grabbing the context", function() {
    expect(function() { test.ContextBase.create(undefined, foam.__context__).foo; }).not.toThrow();
  });
});
