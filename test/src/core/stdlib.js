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

describe('foam.Undefined', function() {
  it('isInstance', function() {
    expect(foam.Undefined.isInstance(undefined)).toBe(true);
    expect(foam.Undefined.isInstance(null)).toBe(false);
  });
  it('clone', function() {
    expect(foam.Undefined.clone(undefined)).toBe(undefined);
  });
  it('equals', function() {
    expect(foam.Undefined.equals("unused", undefined)).toBe(true);
    expect(foam.Undefined.equals("unused", "bad")).toBe(false);
  });
  it('compare', function() {
    expect(foam.Undefined.compare("unused", undefined)).toBe(0);
    expect(foam.Undefined.compare("unused", "defined!")).toBe(1);
  });
  it('hashCode', function() {
    expect(foam.Undefined.hashCode(undefined)).toBe(-2);
    expect(foam.Undefined.hashCode()).toBe(-2);
  });
});

describe('foam.Null', function() {
  it('isInstance', function() {
    expect(foam.Null.isInstance(null)).toBe(true);
    expect(foam.Null.isInstance(undefined)).toBe(false);
  });
  it('clone', function() {
    expect(foam.Null.clone(undefined)).toBe(undefined);
  });
  it('equals', function() {
    expect(foam.Null.equals("unused", null)).toBe(true);
    expect(foam.Null.equals("unused", "bad")).toBe(false);
  });
  it('compare', function() {
    expect(foam.Null.compare("unused", undefined)).toBe(1);
    expect(foam.Null.compare("unused", "defined!")).toBe(1);
    expect(foam.Null.compare("unused", null)).toBe(0);
  });
  it('hashCode', function() {
    expect(foam.Null.hashCode(null)).toBe(-3);
    expect(foam.Null.hashCode()).toBe(-3);
  });
});

describe('foam.Boolean', function() {
  it('isInstance', function() {
    expect(foam.Boolean.isInstance(true)).toBe(true);
    expect(foam.Boolean.isInstance(1)).toBe(false);
    expect(foam.Boolean.isInstance(false)).toBe(true);
    expect(foam.Boolean.isInstance(0)).toBe(false);
  });
  it('clone', function() {
    expect(foam.Boolean.clone(true)).toBe(true);
  });
  it('equals', function() {
    expect(foam.Boolean.equals(true, false)).toBe(false);
    expect(foam.Boolean.equals(true, 1)).toBe(false);
    expect(foam.Boolean.equals(false, 0)).toBe(false);
    expect(foam.Boolean.equals(true, true)).toBe(true);
    expect(foam.Boolean.equals(false, false)).toBe(true);
  });
  it('compare', function() {
    expect(foam.Boolean.compare(true, false)).toBe(1);
    expect(foam.Boolean.compare(false, true)).toBe(-1);
    expect(foam.Boolean.compare(true, true)).toBe(0);
    expect(foam.Boolean.compare(false, false)).toBe(0);

    expect(foam.Boolean.compare(true, 0)).toBe(1);
    expect(foam.Boolean.compare(false, 66)).toBe(1);
    expect(foam.Boolean.compare(true, 9)).toBe(1);
    expect(foam.Boolean.compare(false, 0)).toBe(1);
  });
  it('hashCode', function() {
    expect(foam.Boolean.hashCode(true)).toBe(1);
    expect(foam.Boolean.hashCode(false)).toBe(-1);
  });
});

describe('foam.Function', function() {
  it('isInstance', function() {
    expect(foam.Function.isInstance(function() {})).toBe(true);
    expect(foam.Function.isInstance(9)).toBe(false);
  });
  it('clone', function() {
    var fn = function() {};
    expect(foam.Function.clone(fn)).toBe(fn);
  });
  it('equals', function() {
    var fn1 = function(a) { return a + 1; };
    var fn2 = function(a) { return a + 1; };
    var fnNoMatch = function(b) { return b + 1; };
    expect(foam.Function.equals(fn1, fn2)).toBe(true);
    expect(foam.Function.equals(fn1, fnNoMatch)).toBe(false);
    expect(foam.Function.equals(fn1, undefined)).toBe(false);
  });
  it('compare', function() {
    var fn1 = function(a) { return a + 1; };
    var fn2 = function(a) { return a + 1; };
    var fnNoMatch = function(b) { return b + 1; };
    expect(foam.Function.compare(fn1, fn2)).toBe(0);
    expect(foam.Function.compare(fn1, fnNoMatch)).toBe(-1);
    expect(foam.Function.compare(fnNoMatch, fn1)).toBe(1);
    expect(foam.Function.compare(fnNoMatch, undefined)).toBe(1);
  });
  it('hashCode', function() {
    var fn1 = function(a) { return a + 1; };
    var fn2 = function(b) { return b + 2; };
    expect(foam.Function.hashCode(fn1)).not.toEqual(
      foam.Function.hashCode(fn2));
  });

  it('memoize1 accepts a null argument', function() {
    var f = foam.Function.memoize1(function(arg) { return arg; });
    var r = f(null);
    expect(f(null)).toBe(r);
  });

  it('setName', function() {
    var f = foam.Function.setName(function(a) { return a + 1; },
      'myTestFunction');
    expect(f.name).toBe('myTestFunction');
  });

  it('appendArguments', function() {
    var array1 = ['a'];
    var array2 = ['b'];
    (function(a, b, c, d) {
      foam.Function.appendArguments(array1, arguments);
      foam.Function.appendArguments(array2, arguments, 2);
    })(1, 2, 3, 4);

    // array1 contains all the args
    expect(array1[0]).toBe('a');
    expect(array1[1]).toBe(1);
    expect(array1[2]).toBe(2);
    expect(array1[3]).toBe(3);
    expect(array1[4]).toBe(4);

    // array2 starts with arguments[2]
    expect(array2[0]).toBe('b');
    expect(array2[1]).toBe(3);
    expect(array2[2]).toBe(4);
    expect(array2[3]).toBeUndefined();
  });

  it('argsStr', function() {
    // normal case
    var str = foam.Function.argsStr(
      function(a, /*string=*/b, c /*array*/) {
        return [ a, b, c ];
      }
    );
    expect(str).toBe('a, /*string=*/b, c /*array*/');

    // string with line break
    var str2 = foam.Function.argsStr(
 "function tricky(a, c\r\n /*array*/) { " +
 "        return [ a, b, c ]; " +
 "      } "
    );
    expect(str2).toBe('a, c /*array*/');

    // empty args
    var str3 = foam.Function.argsStr(
      function() {
        return 1;
      }
    );
    expect(str3).toBe('');

    // invalid function string
    expect(function() {
      foam.Function.argsStr(
      "  fun ction invalid(a, c\r \p\n  { " +
      "         return [ a, b, c ]; " +
      "      } "
      );
    }).toThrow();

    // arrow-function: single-arg
    var str4 = foam.Function.argsStr(
      foo => foo.length
    );
    expect(str4).toBe('foo ');
    // arrow-function: multiple args

    var str5 = foam.Function.argsStr(
        (/*string?*/foo, /*array*/bar, /*string*/baz) => foo.length
    );
    expect(str5).toBe('/*string?*/foo, /*array*/bar, /*string*/baz');
  });

  it('functionComment', function() {
    expect(foam.Function.functionComment(function() { })).toEqual('');
    expect(foam.Function.functionComment(function() {/**/ })).toEqual('');
    expect(foam.Function.functionComment(function() {/* hello */ })).toEqual('hello ');

    /* jshint -W014 */
    /* jshint laxcomma:true */
    // jscs:disable

    expect(foam.Function.functionComment(
      function() {//hello
      }
    )).toEqual('');

    expect(foam.Function.functionComment(
      function() {
        var x;
        /** hello */
      }
    )).toEqual('');

    expect(foam.Function.functionComment(function() /* hello */ {})).toEqual('');
    // jscs:enable
    /* jshint laxcomma:false */
    /* jshint +W014 */

  });


  describe('argNames', function() {

    it('handles an empty arg list', function() {
      var fn = function( ) {
        return (true);
      }
      var args = foam.Function.argNames(fn);
      expect(args).toEqual([]);
    });

    it('grabs simple argument names', function() {
      var fn = function(str, bool ,
         func, obj, num,  arr ) {
        return (true);
      }
      var args = foam.Function.argNames(fn);
      expect(args).toEqual([ 'str', 'bool', 'func', 'obj', 'num', 'arr' ]);
    });

    it('grabs typed argument names', function() {
      var fn = function(/* String */ str, /*Boolean*/ bool ,
        /* Function */ func, /*Object*/obj, /* Number */num, /* Array*/ arr ) {
        return (true);
      }
      var args = foam.Function.argNames(fn);
      expect(args).toEqual([ 'str', 'bool', 'func', 'obj', 'num', 'arr' ]);
    });

    it('grabs commented argument names', function() {
      var fn = function(/* any // the argument value to validate. */ arg, more,
          /* // a comment here */ name, another /* return // comment */) {
        return (true);
      }
      var args = foam.Function.argNames(fn);
      expect(args).toEqual([ 'arg', 'more', 'name', 'another' ]);
    });

  });

  it('withArgs', function() {
    // normal case
    var fn = function(a, /*string=*/b, c /*array*/) {
      return [ a + b + c ];
    };
    var src = { a: 'A', b: 'B', c: 'C' };

    expect(foam.Function.withArgs(fn, src)).toEqual(['ABC']);

    // missing args
    var src2 = { a: 'A', c: 'C' };

    expect(foam.Function.withArgs(fn, src2)).toEqual(['AundefinedC']);

    // opt_self
    var fn2 = function(a) {
      return this.value + a;
    };
    var self = { value: 77 };
    expect(foam.Function.withArgs(fn2, src2, self)).toEqual('77A');

    // function args are bound
    var selfFns = {
      a: function() { return this.valA; },
      b: function() { return this.valB; },
      valA: 5,
      valB: 100
    };
    var selfData = { // will not bind to these values
      valA: 66,
      valB: 999
    };
    var fnCallthru = function(a, b) {  return a() + b(); }
    expect(foam.Function.withArgs(fnCallthru, selfFns, selfData))
      .toEqual(105);

  });
});

describe('foam.Number', function() {
  it('isInstance', function() {
    expect(foam.Number.isInstance(2)).toBe(true);
    expect(foam.Number.isInstance('2')).toBe(false);
    expect(foam.Number.isInstance(Math.Infinity)).toBe(false);
    expect(foam.Number.isInstance(null)).toBe(false);
  });
  it('clone', function() {
    expect(foam.Number.clone(9)).toBe(9);
  });
  it('equals', function() {
    expect(foam.Number.equals(44, 44)).toBe(true);
    expect(foam.Number.equals(NaN, NaN)).toBe(true);
    expect(foam.Number.equals(56, '56')).toBe(false);
    expect(foam.Number.equals(0, false)).toBe(false);
  });
  it('compare', function() {
    expect(foam.Number.compare(3, 4)).toBe(-1);
    expect(foam.Number.compare(4, 3)).toBe(1);
    expect(foam.Number.compare(24, 24)).toBe(0);

    expect(foam.Number.compare(3, null)).toBe(1);
    expect(foam.Number.compare(3, undefined)).toBe(1);

  });
  it('hashCode', function() {
    expect(foam.Number.hashCode(5)).toBe(5);
    // caps at 32-bits
    expect(foam.Number.hashCode(999999999999)).toBe(-727379969);
    expect(foam.Number.hashCode(329719442019.76715)).toBe(-1160223942);
  });
});

describe('foam.String', function() {
  it('isInstance', function() {
    expect(foam.String.isInstance('hello')).toBe(true);
    expect(foam.String.isInstance('2')).toBe(true);
    expect(foam.String.isInstance('')).toBe(true);
    expect(foam.String.isInstance(2)).toBe(false);
    expect(foam.String.isInstance(null)).toBe(false);
  });
  it('clone', function() {
    expect(foam.String.clone('clone me')).toBe('clone me');
  });
  it('equals', function() {
    expect(foam.String.equals('a string', 'a string')).toBe(true);
    expect(foam.String.equals('a string', 'not the same')).toBe(false);
  });
  it('compare', function() {
    expect(foam.String.compare('string a', 'string c')).toBeLessThan(0);
    expect(foam.String.compare('string b', 'string a')).toBeGreaterThan(0);
    expect(foam.String.compare('string d', 'string d')).toBe(0);

    expect(foam.String.compare('string d', null)).toBe(1);
    expect(foam.String.compare('string d', undefined)).toBe(1);
  });
  it('hashCode', function() {
    expect(foam.String.hashCode('a short string'))
      .not.toBe(foam.String.hashCode('a shorp string'))
    expect(foam.String.hashCode(
      'here is a very very long string' +
      'that could, in theory, be harder to' +
      'uniquely hash given that only one character' +
      'has changed in the slightest.'
    )).not.toBe(foam.String.hashCode(
      'here is a very very long string' +
      'that could, in theory, be harder to' +
      'uniquely hash giwen that only one character' +
      'has changed in the slightest.'
    ))
  });

  it('constantize', function() {
    expect(foam.String.constantize("camelCaseName"))
      .toBe("CAMEL_CASE_NAME");
    expect(foam.String.constantize("under_Score"))
      .toBe("UNDER_SCORE");
    expect(foam.String.constantize("ALREADY_CONST_NAME"))
      .toBe("ALREADY_CONST_NAME");
    expect(function() {
      foam.String.constantize(null);
    }).toThrow();
  });

  it('capitalize', function() {
    expect(foam.String.capitalize('lower Case String'))
      .toBe('Lower Case String');
    expect(foam.String.capitalize('99$$'))
      .toBe('99$$');
    expect(function() {
      foam.String.capitalize(null);
    }).toThrow();

  });

  it('labelize', function() {
    expect(foam.String.labelize("camelCaseName"))
      .toBe("Camel Case Name");
    expect(foam.String.labelize("CONSTANT_NAME"))
      .toBe("CONSTANT_NAME");
    expect(foam.String.labelize(''))
      .toBe('');
    expect(foam.String.labelize(null))
      .toBe('');
    expect(function() {
      foam.String.labelize({ thing: 'object' });
    }).toThrow();
  });

  it('toSlotName', function() {
    expect(foam.String.toSlotName("name"))
      .toBe("name$");
    expect(foam.String.toSlotName("name$"))
      .toBe("name$$");
    expect(foam.String.toSlotName(''))
      .toBe('$');
    expect(function() {
      foam.String.toSlotName(null);
    }).toThrow();
  });

  it('toUpperCase', function() {
    expect(foam.String.toUpperCase('lower Case String'))
      .toBe('LOWER CASE STRING');
    expect(foam.String.toUpperCase('99$$'))
      .toBe('99$$');
    expect(function() {
      foam.String.toUpperCase(null);
    }).toThrow();

  });

  it('cssClassize', function() {
    expect(foam.String.cssClassize('some.class.Name'))
      .toBe('some-class-Name');
    expect(foam.String.cssClassize('99.$$'))
      .toBe('99-$$');
    expect(function() {
      foam.String.cssClassize(null);
    }).toThrow();

  });

  it('multiline', function() {
    expect(foam.String.multiline("already \na string"))
      .toEqual("already \na string");

    expect(foam.String.multiline(function(
      ) {/*
        multiline
        function
    */}))
      .toEqual("\n        multiline\n        function\n    ");

    expect(foam.String.multiline(function() {}))
      .toEqual('');

  });

  it('intern', function() {
    expect(foam.String.intern('my '+'string'))
      .toBe(foam.String.intern('my'+' string'));
  });

  it('startsWithIC', function() {
    expect(foam.String.startsWithIC('my string', 'MY '))
      .toBe(true);
    expect(foam.String.startsWithIC('mY string', 'my '))
      .toBe(true);
    expect(foam.String.startsWithIC('my string', 'string'))
      .toBe(false);
  });

  it('pad', function() {
    expect(foam.String.pad("wee", -6)).toEqual("   wee");
    expect(foam.String.pad("wee", 6)).toEqual("wee   ");
  });

});

describe('foam.Array', function() {
  describe('diff', function() {
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
      x = test.CompA.create(undefined, foam.__context__);
      y = test.CompB.create(undefined, foam.__context__);
    });
    afterEach(function() {
      x = y = null;
    });

    it('reports no change correctly', function() {
      var a = ['a', 't', x];
      expect(foam.Array.diff(a, a).added).toEqual([]);
      expect(foam.Array.diff(a, a).removed).toEqual([]);

      var b = [];
      expect(foam.Array.diff(b, b).added).toEqual([]);
      expect(foam.Array.diff(b, b).removed).toEqual([]);
    });
    it('finds added primitive elements', function() {
      var a = ['a', 't'];
      var b = ['a', 'r', 't'];
      expect(foam.Array.diff(a, b).added).toEqual(['r']);
    });
    it('finds removed primitive elements', function() {
      var a = ['a', 't'];
      var b = ['a', 'r', 't'];
      expect(foam.Array.diff(b, a).removed).toEqual(['r']);
    });
    it('finds added object elements', function() {
      var a = [x, 4];
      var b = [y, x, 4];
      expect(foam.Array.diff(a, b).added).toEqual([y]);
    });
    it('finds removed object elements', function() {
      var a = [y, 4];
      var b = [y, x, 4];
      expect(foam.Array.diff(b, a).removed).toEqual([x]);
    });
    it('finds swapped elements', function() {
      var a = [y, 4, 8];
      var b = [4, x, 'hello'];
      expect(foam.Array.diff(a, b).added).toEqual([x, 'hello']);
      expect(foam.Array.diff(a, b).removed).toEqual([y, 8]);
    });
    it('treats multiple copies of an element as separate items', function() {
      var a = [4,5,6,7,8,8];
      var b = [4,4,4,4,8,8];
      expect(foam.Array.diff(a, b).added).toEqual([4,4,4]);
      expect(foam.Array.diff(a, b).removed).toEqual([5,6,7]);
    });
  });

  describe('clone (deep copy)', function() {
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
      expect(foam.util.compare(a[1], b[1])).toBe(0);
      expect(a[1]).not.toBe(b[1]);
    });
  });

  it('isInstance', function() {
    expect(foam.Array.isInstance([])).toBe(true);
    expect(foam.Array.isInstance(88)).toBe(false);
    expect(foam.Array.isInstance({ 0: 'a', 1: 'b' })).toBe(false);
    (function(a, b, c) {
      expect(foam.Array.isInstance(arguments)).toBe(false);
    })(1, 2, 3);
  });

  it('equals', function() {
    expect(foam.Array.equals([], [])).toBe(true);
    expect(foam.Array.equals([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(foam.Array.equals([44, 33], ['44', 33])).toBe(false);
    expect(foam.Array.equals([[1, 2], [3, 4]], [[1, 2], [3, 4]])).toBe(true);
    expect(foam.Array.equals([33], ['44', 33])).toBe(false);
    expect(foam.Array.equals([33], null)).toBe(false);
    expect(foam.Array.equals([33], 33)).toBe(false);
  });

  it('compare', function() {
    expect(foam.Array.compare([1, 2, 3], [1, 2, 3])).toBe(0);
    expect(foam.Array.compare([1, 2, 4], [1, 2, 3])).toBe(1);
    expect(foam.Array.compare([1, 1, 3], [1, 2, 3])).toBe(-1);

    expect(foam.Array.compare([1, 2, 3], [1, 2])).toBe(1);
    expect(foam.Array.compare([1, 2], [1, 2, 3])).toBe(-1);

    expect(foam.Array.compare([1, 2], null)).toBe(1);
  });

  it('hashCode', function() {
    // ordering matters
    expect(foam.Array.hashCode(['a string', 'b string']))
      .not.toBe(foam.Array.hashCode(['b string', 'a string']));

    // slight change results in different hash
    expect(foam.Array.hashCode([1,2,3,4,5,6,7,8,9]))
      .not.toBe(foam.Array.hashCode([1,2,3,3,5,6,7,8,9]));

  });

});


describe('foam.Date', function() {
  beforeEach(function() {
    jasmine.clock().install();
  });
  afterEach(function() {
    jasmine.clock().uninstall();
  });

  it('isInstance', function() {
    expect(foam.Date.isInstance(new Date(040404848))).toBe(true);
    expect(foam.Date.isInstance((new Date(040404848)).toString())).toBe(false);
    expect(foam.Date.isInstance(null)).toBe(false);
  });

  it('clone', function() {
    var d1 = new Date(040404848);
    var d2 = foam.Date.clone(d1);
    d1.setTime(283232323);

    expect(foam.Date.equals(d1, d2)).toBe(false);
    expect(d1.getTime()).not.toEqual(d2.getTime());
  });

  it('getTime', function() {
    expect(foam.Date.getTime(new Date(40404848))).toBe(40404848);
    expect(foam.Date.getTime(null)).toBe(0);
    expect(foam.Date.getTime(1231234)).toBe(1231234);
  });

  it('hashCode', function() {
    expect(foam.Date.hashCode(new Date(2342346)))
      .not.toEqual(foam.Date.hashCode(new Date(2342347)));
  });

  it('equals', function() {
    expect(foam.util.equals(new Date(7487474), new Date(7487474))).toBe(true);
    expect(foam.util.equals(new Date(7487474), new Date(23423432))).toBe(false);

    expect(foam.util.equals((new Date(7487474), null))).toBe(false);
    expect(foam.util.equals(new Date(7487474), 7487474)).toBe(true);
  });

  it('compare', function() {
    expect(foam.util.compare(new Date(7487474), new Date(7487474))).toBe(0);
    expect(foam.util.compare(new Date(234324), new Date(23423432))).toBe(-1);

    expect(foam.util.compare(new Date(234324), null)).not.toBe(0);
    var date = new Date(2423);
    expect(foam.util.compare(date, date)).toBe(0);
  });

  it('relativeDateString', function() {
    var baseDate = new Date(99999 - 60000*60*24*(365+9) - 60000*61*2 - 1000);
    var d =        new Date(99999);

    // account for timezone of the host running this test
    var dateStrWithYear = d.toDateString().substring(4);
    var dateStrNoYear = d.toDateString()
      .replace(' ' + (1900 + d.getYear()), '').substring(4);

    jasmine.clock().mockDate(baseDate);
    // future cases
    expect(foam.Date.relativeDateString(d)).toEqual(dateStrWithYear);
    jasmine.clock().tick(60000*60*24*365);
    expect(foam.Date.relativeDateString(d)).toEqual(dateStrNoYear);
    jasmine.clock().tick(60000*60*24*7);
    expect(foam.Date.relativeDateString(d)).toEqual('in 2 days');
    jasmine.clock().tick(60000*60*24);
    expect(foam.Date.relativeDateString(d)).toEqual('in 1 day');
    jasmine.clock().tick(60000*60*24);
    expect(foam.Date.relativeDateString(d)).toEqual('in 2 hours');
    jasmine.clock().tick(60000*60);
    expect(foam.Date.relativeDateString(d)).toEqual('in 1 hour');
    jasmine.clock().tick(60000*60);
    expect(foam.Date.relativeDateString(d)).toEqual('in 2 minutes');
    jasmine.clock().tick(60000);
    expect(foam.Date.relativeDateString(d)).toEqual('in 1 minute');
    jasmine.clock().tick(60000);
    expect(foam.Date.relativeDateString(d)).toEqual('in moments');

    // past cases
    jasmine.clock().tick(1000);
    expect(foam.Date.relativeDateString(d)).toEqual('moments ago');
    jasmine.clock().tick(1000);
    expect(foam.Date.relativeDateString(d)).toEqual('moments ago');
    jasmine.clock().tick(60000);
    expect(foam.Date.relativeDateString(d)).toEqual('1 minute ago');
    jasmine.clock().tick(60000);
    expect(foam.Date.relativeDateString(d)).toEqual('2 minutes ago');
    jasmine.clock().tick(60000*60);
    expect(foam.Date.relativeDateString(d)).toEqual('1 hour ago');
    jasmine.clock().tick(60000*60);
    expect(foam.Date.relativeDateString(d)).toEqual('2 hours ago');
    jasmine.clock().tick(60000*60*24);
    expect(foam.Date.relativeDateString(d)).toEqual('1 day ago');
    jasmine.clock().tick(60000*60*24);
    expect(foam.Date.relativeDateString(d)).toEqual('2 days ago');
    jasmine.clock().tick(60000*60*24*7);
    expect(foam.Date.relativeDateString(d)).toEqual(dateStrNoYear);
    jasmine.clock().tick(60000*60*24*365);
    expect(foam.Date.relativeDateString(d)).toEqual(dateStrWithYear);


  });
});


describe('foam.Object', function() {

  it('forEach', function() {
    var aProto = { f: 'hello' };
    var a = {
      __proto__: aProto,
      c: 2,
      d: 3,
      e: 4,
      b: 1,
    };
    var results = [];
    foam.Object.forEach(a, function(val) {
      results.push(val);
    });
    expect(results.length).toBe(4);
    expect(results[0]).toBe(2);
    expect(results[1]).toBe(3);
    expect(results[2]).toBe(4);
    expect(results[3]).toBe(1);
  });

  it('isInstance', function() {
    expect(foam.Object.isInstance({})).toBe(true);
    expect(foam.Object.isInstance([])).toBe(false);
    expect(foam.Object.isInstance(66)).toBe(false);
    expect(foam.Object.isInstance(null)).toBe(false);
  });
  it('clone', function() {
    var a = { d: "hello" };
    expect(foam.Object.clone(a)).toBe(a);
  });
  it('equals', function() {
    var a = { d: "hello" };
    var b = { d: "hello" };
    expect(foam.Object.equals(a, b)).toBe(false);
    expect(foam.Object.equals(a, a)).toBe(true);
    expect(foam.Object.equals(a, null)).toBe(false);
  });
  it('compare', function() {
    var a = { d: "hello" };
    var b = { d: "hello" };
    a.$UID; // UID ordering matters
    b.$UID;
    expect(foam.Object.compare(a, b)).toBe(-1);
    expect(foam.Object.compare(b, a)).toBe(1);
    expect(foam.Object.compare(a, undefined)).toBe(1);
  });
  it('hashCode', function() {
    expect(foam.Object.hashCode({ key: 'anything' })).toEqual(
        foam.Object.hashCode({ key: 'anything' }));
    expect(foam.Object.hashCode({ key: 'anything' })).not.toEqual(
        foam.Object.hashCode({ key: 'anything else' }));
    expect(foam.Object.hashCode({ key: 'anything' })).not.toEqual(
        foam.Object.hashCode({ key: 'anything', other: false }));
    expect(foam.Object.hashCode({ key: 'anything' })).not.toEqual(
        foam.Object.hashCode({ key: 'anything', other: undefined }));
    expect(foam.Object.hashCode({ key: 'anything' })).not.toEqual(
        foam.Object.hashCode({ key: 'anything', other: null }));

    var values = [
      undefined, null, false, 0, '',                                 // Falseys
      foam.core.FObject.create(), {}, true, 9, -9, [], function() {} // Truthys
    ];

    for ( var i = 0; i < values.length; i++ ) {
      for ( var j = i + 1; j < values.length; j++ ) {
        expect(foam.Object.hashCode({ key: values[i] })).not.toEqual(
            foam.Object.hashCode({ key: values[j] }));
      }
    }
  });
  it('freeze', function() {
    var a = { d: "hello" };
    foam.Object.freeze(a);
    expect(a.$UID).toBeGreaterThan(0);
    a.d = "fail";
    expect(a.d).toEqual("hello");
  });

});

describe('foam.mmethod', function() {
  it('handles primitive types', function() {
    var mm = foam.mmethod({
      String: function(val) { return foam.String.isInstance(val); },
      Number: function(val) { return foam.Number.isInstance(val); },
      Boolean: function(val) { return foam.Boolean.isInstance(val); },
      Object: function(val) { return foam.Object.isInstance(val); },
      Array: function(val) { return foam.Array.isInstance(val); },
      Date: function(val) { return foam.Date.isInstance(val); },
    });

    expect(mm("hello")).toBe(true);
    expect(mm(77)).toBe(true);
    expect(mm(true)).toBe(true);
    expect(mm({})).toBe(true);
    expect(mm([1])).toBe(true);
    expect(mm(new Date(343434))).toBe(true);

    expect(function() {
      mm(foam.core.Property.create({ name: 'prop' }));
    }).toThrow();
  });

  it('handles FObjects', function() {
    var mm = foam.mmethod({
      String: function(val) { return foam.String.isInstance(val); },
      Number: function(val) { return foam.Number.isInstance(val); },
      FObject: function(val) { return val.cls_.name; }
    });

    expect(mm("hello")).toBe(true);
    expect(mm(77)).toBe(true);
    expect(mm(foam.core.Property.create({name: 'prop'}))).toEqual("Property");
  });

  it('uses supplied default method', function() {
    var mm = foam.mmethod({
      String: function(val) { return foam.String.isInstance(val); },
      Number: function(val) { return foam.Number.isInstance(val); },
    }, function() { return "Default!"; } );

    expect(mm("hello")).toBe(true);
    expect(mm(77)).toBe(true);
    expect(mm(foam.core.Property.create({name: 'prop'}))).toEqual("Default!");
    expect(mm(true)).toEqual("Default!");
  });

  it('handles subclasses', function() {
    var mm = foam.mmethod({
      'foam.core.StringArray': function() { return 'stringarray'; },
      'foam.core.Property': function() { return 'prop'; },
      'foam.core.FObject': function() { return 'FObject'; }
    });

    expect(mm(foam.core.StringArray.create({name:'n'})))
      .toBe('stringarray');
    expect(mm(foam.core.String.create({name:'n'})))
      .toBe('prop');
    expect(mm(foam.core.Property.create({name:'n'})))
      .toBe('prop');
    expect(mm(foam.core.Method.create({name:'n'})))
      .toBe('FObject');

  });
});


describe('foam.util', function() {
  it('handles a buffet of types', function() {
    var types = [
      99,
      "hello",
      function() {},
      new Date(4843090),
      foam.core.Property.create({ name: 'prop' }),
      { a: 'A' },
      [ 2, 4 ]
    ];
    types.forEach(function(t, i) {
      // Creating array of other types to verify symmetry property.
      var typesDiff = types.slice();
      typesDiff.splice(i);

      expect(foam.util.equals(foam.util.clone(t), t)).toBe(true);
      expect(foam.util.equals(t, t)).toBe(true);
      expect(foam.util.compare(t, t)).toBe(0);

      typesDiff.forEach(function(d) {
        expect(foam.util.compare(t, d)).not.toBe(foam.util.compare(d, t));
      });

      expect(foam.util.hashCode(t)).not.toBeUndefined();
      expect(foam.util.hashCode(t)).not.toBeNull();
      if ( foam.typeOf(t).diff ) {
        expect(foam.util.diff(t, t)).toBeTruthy();
      } else {
        expect(foam.util.diff(t, t)).toBeUndefined();
      }
    });
  });

  it('handles a more indepth comparison of types', function() {
    var obj1 = {};
    var obj2 = {};
    var refObj1 = obj1;

    var items = [ undefined, null, false, true, 0, 1, '', 'potato',
      obj1, obj2, refObj1, new Date(0), new Date(0), new Date(),
      foam.core.FObject.create(), foam.core.FObject.create() ];
    var len = items.length;

    for (var i = 0; i < len; i++) {
      for (var j = i; j < len; j++) {
        expect(foam.util.compare(items[i], items[j]))
            .toBe(-foam.util.compare(items[j], items[i]));
      }
    }
  });
});


describe('foam.package', function() {
  it('ensurePackage', function() {
    var root = { package1: { subPack1: { a: 1 }, subPack2: { a: 2 } }, package2: { a: 3 } };

    expect(foam.package.ensurePackage(root, '')).toBe(root);
    expect(foam.package.ensurePackage(root)).toBe(root);
    expect(foam.package.ensurePackage(root, null)).toBe(root);

    expect(function() {
      foam.package.ensurePackage(root, { bad: 'path' });
    }).toThrow();

    expect(foam.package.ensurePackage(root, 'package2').a).toBe(3);
    expect(foam.package.ensurePackage(root, 'package1.subPack1').a).toBe(1);
    expect(foam.package.ensurePackage(root, 'package1.subPack2').a).toBe(2);

  });

  it('registerClass', function() {
    expect(function() {
      foam.package.registerClass("Not an object");
    }).toThrow();
    expect(function() {
      foam.package.registerClass({ name: 88 });
    }).toThrow();
    expect(function() {
      foam.package.registerClass({ name: { not: 'a string' } });
    }).toThrow();

    foam.package.registerClass({
      name: "TestClassForPackageTest",
      package: 'test.packageTest'
    });
    expect(test.packageTest.TestClassForPackageTest.name)
      .toBe("TestClassForPackageTest");

  });

});

describe('foam.uuid', function() {
  it('randomGUID', function() {
    expect(foam.uuid.randomGUID()).not.toEqual(foam.uuid.randomGUID());
  });
});
