/**
 * @license
 * Copyright 2017 The FOAM Author. All Rights Reserved.
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

describe('Serialization', function() {
  it('should accept default class', function() {
    foam.CLASS({
      package: 'test',
      name: 'Cls'
    });

    var out = foam.json.Outputter.create();
    expect(out.objectify(test.Cls.create())).
        toEqual({ class: 'test.Cls' });
    expect(out.objectify(test.Cls.create(), test.Cls)).
        toEqual({});
    expect(foam.json.Strict.stringify(test.Cls.create())).
        toBe('{"class":"test.Cls"}');
    expect(foam.json.Strict.stringify(test.Cls.create(), test.Cls)).
        toBe('{}');
  });

  it('should store non-default class', function() {
    foam.CLASS({
      package: 'test',
      name: 'Cls'
    });
    foam.CLASS({
      package: 'test',
      name: 'Cls2'
    });

    expect(foam.json.Outputter.create().
           objectify(test.Cls2.create(), test.Cls)).
      toEqual({ class: 'test.Cls2' });
    expect(foam.json.Strict.stringify(test.Cls2.create(), test.Cls)).
      toBe('{"class":"test.Cls2"}');
  });

  it('should not store default property class', function() {
    foam.CLASS({
      package: 'test',
      name: 'Alice'
    });
    foam.CLASS({
      package: 'test',
      name: 'Bob',

      properties: [
        {
          class: 'FObjectProperty',
          of: 'test.Alice',
          name: 'alice'
        }
      ]
    });

    expect(foam.json.Outputter.create().
           objectify(test.Bob.create({
             alice: test.Alice.create()
           }), test.Bob)).
      toEqual({ alice: {} });
  });

  it('should store non-default property class', function() {
    foam.CLASS({
      package: 'test',
      name: 'Andy'
    });
    foam.CLASS({
      package: 'test',
      name: 'Andy2',
      extends: 'test.Andy'
    });
    foam.CLASS({
      package: 'test',
      name: 'Beth',

      properties: [
        {
          class: 'FObjectProperty',
          of: 'test.Andy',
          name: 'andy'
        }
      ]
    });

    expect(foam.json.Outputter.create().
           objectify(test.Beth.create({
             andy: test.Andy2.create()
           }), test.Beth)).
      toEqual({ andy: { class: 'test.Andy2' } });
  });

  it('should store only non-default classes on array elements', function() {
    foam.CLASS({
      package: 'test',
      name: 'Animal'
    });
    foam.CLASS({
      package: 'test',
      name: 'Mammal',
      extends: 'test.Animal'
    });

    expect(foam.json.Outputter.create().objectify(
            [ test.Animal.create(), test.Mammal.create() ], test.Animal)).
        toEqual([ {}, { class: 'test.Mammal' } ]);
  });

  it('should store only non-default classes on array property elements', function() {
    foam.CLASS({
      package: 'test',
      name: 'Jane'
    });
    foam.CLASS({
      package: 'test',
      name: 'James',
      extends: 'test.Jane'
    });
    foam.CLASS({
      package: 'test',
      name: 'Js',

      properties: [
        {
          class: 'FObjectArray',
          of: 'test.Jane',
          name: 'js',
          factory: function() {
            return [ test.Jane.create(), test.James.create() ];
          }
        }
      ]
    });

    expect(foam.json.Outputter.create().objectify(test.Js.create(), test.Js)).
        toEqual({ js: [ {}, { class: 'test.James' } ] });
  });
});
