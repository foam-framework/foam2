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

describe('foam.LIB type checking:', function() {
  var oldAssert;
  beforeEach(function() { // make it easy to trap asserts
    oldAssert = console.assert;
    console.assert = function() { throw arguments; }
  });
  afterEach(function() {
    console.assert = oldAssert;
  });

  it('methods must be named', function() {
    expect(function() {
      foam.LIB({
        name: 'foam.testlib',
        methods: [
          function() {
          }
        ]
      })
    }).toThrow();
  });

  it('methods must be functions or maps', function() {
    expect(function() {
      foam.LIB({
        name: 'foam.testlib',
        methods: [
          'hello'
        ]
      })
    }).toThrow();
  });

  it('methods as maps must have .code', function() {
    expect(function() {
      foam.LIB({
        name: 'foam.testlib',
        methods: [
          {
            name: 'hello'
          }
        ]
      })
    }).toThrow();
  });
});

describe('foam.LIB', function() {
  it('constants', function() {
    foam.LIB({
        name: 'foam.testlib',
        constants: {
          CONST: 'val'
        }
    });
    expect(foam.testlib.CONST).toEqual('val');
  });

  it('methods', function() {
    foam.LIB({
      name: 'foam.testlib',
      methods: [
        function hello() {
          return "hello world.";
        },
        {
          name: 'longMethod',
          code: function() {
            return "long " + this.hello();
          }
        }
      ]
    });

    expect(foam.testlib.hello()).toBe("hello world.");
    expect(foam.testlib.longMethod()).toBe("long hello world.");
  });
});

describe('Object.$UID', function() {
  it('is unique', function() {
      var o1 = {};
      var o2 = {};
      expect(o1.$UID).not.toEqual(o2.$UID);

      var o3 = {};
      expect(o1.$UID).not.toEqual(o3.$UID);
      expect(o2.$UID).not.toEqual(o3.$UID);
  });
});

describe('fn.memoize1', function() {

  beforeEach(function() {
  });
  afterEach(function() {
  });

  it('accepts a null argument', function() {
    var f = foam.Function.memoize1(function(arg) { return arg; });
    var r = f(null);
    expect(f(null)).toBe(r);
  });

});


describe('string.pad', function() {

  beforeEach(function() {
  });
  afterEach(function() {
  });

  it('pads left', function() {
    expect(foam.String.pad("wee", -6)).toEqual("   wee");
  });

});

/*
describe('String.compareTo', function() {

  beforeEach(function() {
  });
  afterEach(function() {
  });

  it('compares', function() {
    var n = new String("bbb");
    expect(foam.util.compare(n, "bbb")).toEqual(0);
    expect(foam.util.compare(n, "aa")).toEqual(1);
    expect(foam.util.compare(n, "ccc")).toEqual(-1);
  });

});
*/

describe('Array diff', function() {
  var x;
  var y;

  beforeEach(function() {
    foam.CLASS({
      package: 'test',
      name: 'CompA',
      properties: [ 'a', 'b' ]
    });
    foam.CLASS({
      package: 'test',
      name: 'CompB',
      properties: [ 'b', 'c' ]
    });
    x = test.CompA.create();
    y = test.CompB.create();
  });
  afterEach(function() {
    x = y = null;
  });

  it('reports no change correctly', function() {
    var a = ['a', 't', x];
    expect(foam.util.diff(a, a).added).toEqual([]);
    expect(foam.util.diff(a, a).removed).toEqual([]);

    var b = [];
    expect(foam.util.diff(b, b).added).toEqual([]);
    expect(foam.util.diff(b, b).removed).toEqual([]);
  });
  it('finds added primitive elements', function() {
    var a = ['a', 't'];
    var b = ['a', 'r', 't'];
    expect(foam.util.diff(a, b).added).toEqual(['r']);
  });
  it('finds removed primitive elements', function() {
    var a = ['a', 't'];
    var b = ['a', 'r', 't'];
    expect(foam.util.diff(b, a).removed).toEqual(['r']);
  });
  it('finds added object elements', function() {
    var a = [x, 4];
    var b = [y, x, 4];
    expect(foam.util.diff(a, b).added).toEqual([y]);
  });
  it('finds removed object elements', function() {
    var a = [y, 4];
    var b = [y, x, 4];
    expect(foam.util.diff(b, a).removed).toEqual([x]);
  });
  it('finds swapped elements', function() {
    var a = [y, 4, 8];
    var b = [4, x, 'hello'];
    expect(foam.util.diff(a, b).added).toEqual([x, 'hello']);
    expect(foam.util.diff(a, b).removed).toEqual([y, 8]);
  });
  it('treats multiple copies of an element as separate items', function() {
    var a = [4,5,6,7,8,8];
    var b = [4,4,4,4,8,8];
    expect(foam.util.diff(a, b).added).toEqual([4,4,4]);
    expect(foam.util.diff(a, b).removed).toEqual([5,6,7]);
  });
});

describe('Array clone (deep copy)', function() {
  it('creates a new array', function() {
    var a = [2,4,6,8];
    var b = foam.util.clone(a);
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
  it('clones instances', function() {
    var a = [2, foam.core.Property.create({ name: 'hello' }), 4];
    var b = foam.util.clone(a);
    expect(a).not.toBe(b);
    expect(a[1].compareTo(b[1])).toEqual(0);
    expect(a[1]).not.toBe(b[1]);
  });
});

describe('foam.Function.formalArgs', function() {

  it('handles an empty arg list', function() {
    var fn = function( ) {
      return (true);
    }
    var args = foam.Function.formalArgs(fn);
    expect(args).toEqual([]);
  });

  it('grabs simple argument names', function() {
    var fn = function(str, bool ,
       func, obj, num,  arr ) {
      return (true);
    }
    var args = foam.Function.formalArgs(fn);
    expect(args).toEqual([ 'str', 'bool', 'func', 'obj', 'num', 'arr' ]);
  });

  it('grabs typed argument names', function() {
    var fn = function(/* string */ str, /*boolean*/ bool ,
      /* function*/ func, /*object*/obj, /* number */num, /* array*/ arr ) {
      return (true);
    }
    var args = foam.Function.formalArgs(fn);
    expect(args).toEqual([ 'str', 'bool', 'func', 'obj', 'num', 'arr' ]);
  });

  it('grabs commented argument names', function() {
    var fn = function(/* any // the argument value to validate. */ arg, more,
        /* // a comment here */ name, another /* return // comment */) {
      return (true);
    }
    var args = foam.Function.formalArgs(fn);
    expect(args).toEqual([ 'arg', 'more', 'name', 'another' ]);
  });

});


describe('Date', function() {
  beforeEach(function() {
    jasmine.clock().install();
  });
  afterEach(function() {
    jasmine.clock().uninstall();
  });

  it('correctly reports equals', function() {
    expect(foam.util.equals(new Date(7487474), new Date(7487474))).toBe(true);
    expect(foam.util.equals(new Date(7487474), new Date(23423432))).toBe(false);

    expect(foam.util.equals((new Date(7487474), null))).toBe(false);
    expect(foam.util.equals(new Date(7487474), 7487474)).toBe(true);
  });
  it('correctly reports compareTo', function() {
    expect(foam.util.compare(new Date(7487474), new Date(7487474))).toEqual(0);
    expect(foam.util.compare(new Date(234324), new Date(23423432))).toEqual(-1);

    expect(foam.util.compare(new Date(234324), null)).toEqual(1);
    var date = new Date(2423);
    expect(foam.util.compare(date, date)).toEqual(0);
  });

  // TODO: fix time zone
  // it('correctly generates relative strings', function() {
  //   var baseDate = new Date(99999);
  //   var d =        new Date(99999);
  //
  //   jasmine.clock().mockDate(baseDate);
  //
  //   expect(foam.Date.relativeDateString(d)).toEqual('moments ago');
  //   jasmine.clock().tick(1000);
  //   expect(foam.Date.relativeDateString(d)).toEqual('moments ago');
  //
  //   jasmine.clock().tick(60000);
  //   expect(foam.Date.relativeDateString(d)).toEqual('1 minute ago');
  //
  //   jasmine.clock().tick(60000);
  //   expect(foam.Date.relativeDateString(d)).toEqual('2 minutes ago');
  //
  //   jasmine.clock().tick(60000*60);
  //   expect(foam.Date.relativeDateString(d)).toEqual('1 hour ago');
  //
  //   jasmine.clock().tick(60000*60);
  //   expect(foam.Date.relativeDateString(d)).toEqual('2 hours ago');
  //
  //   jasmine.clock().tick(60000*60*24);
  //   expect(foam.Date.relativeDateString(d)).toEqual('1 day ago');
  //
  //   jasmine.clock().tick(60000*60*24);
  //   expect(foam.Date.relativeDateString(d)).toEqual('2 days ago');
  //
  //   jasmine.clock().tick(60000*60*24*7);
  //   expect(foam.Date.relativeDateString(d)).toEqual('Dec 31');
  //
  //   jasmine.clock().tick(60000*60*24*365);
  //   expect(foam.Date.relativeDateString(d)).toEqual('Dec 31 1969');
  // });
});

describe('String.daoize', function() {
  it('should convert "FooBar" to "fooBarDAO"', function() {
    expect(foam.String.daoize('Foo')).toBe('fooDAO');
    expect(foam.String.daoize('FooBar')).toBe('fooBarDAO');
  });
});
