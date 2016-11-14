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

/* global RetType, captureLog, matchingLine, TypeA, TypeB, TypeBB, test */
describe('coverage for debugging helpers', function() {
  it('covers describe()', function() {
    var p = foam.core.Property.create({ name: 'prop' });
    p.describe();
    p.cls_.describe();
  });
});


function makeTestFn() {
  foam.CLASS({  name: 'TypeA' });
  foam.CLASS({  name: 'TypeB' });
  foam.CLASS({  name: 'TypeBB', extends: 'TypeB' });
  foam.CLASS({  name: 'package.TypeC' });
  foam.CLASS({  name: 'RetType' });
  return function test(/* TypeA // docs for, pA */ paramA, /*TypeB?*/ paramB , /* package.TypeC*/ paramC, noType /* RetType */ ) {
    return (RetType.create());
  };
}
function makePrimitiveTestFn() { // multiline parsing, ha
return function(/* string */ str, /*boolean*/ bool ,
  /* function*/ func, /*object*/obj, /* number */num, /* array*/ arr ) {
    return (true);
  };
}

describe('foam.types.getFunctionArgs', function() {
  var fn;

  beforeEach(function() {
    fn = makeTestFn();
  });
  afterEach(function() {
    fn = null;
  });

  it('returns the types of arguments', function() {
    var params = foam.types.getFunctionArgs(fn);

    expect(params[0].name).toEqual('paramA');
    expect(params[0].typeName).toEqual('TypeA');
    expect(params[0].optional).toBe(false);
    expect(params[0].documentation).toEqual('docs for, pA');

    expect(params[1].name).toEqual('paramB');
    expect(params[1].typeName).toEqual('TypeB');
    expect(params[1].optional).toBe(true);

    expect(params[2].name).toEqual('paramC');
    expect(params[2].typeName).toEqual('package.TypeC');
    expect(params[2].optional).toBe(false);

    expect(params[3].name).toEqual('noType');
    expect(params[3].typeName).toBeUndefined();
    expect(params[3].optional).toBe(false);

    expect(params.returnType.typeName).toEqual('RetType');

  });
  it('accepts a return with no args', function() {
    var params = foam.types.getFunctionArgs(function(/*RetType*/){});

    expect(params.returnType.typeName).toEqual('RetType');
  });

  it('reports parse failures', function() {
    fn = function(/*RetType*/){};
    fn.toString = function() { return "some garbage string!"; };

    expect(function() { foam.types.getFunctionArgs(fn); }).toThrow();
  });
  it('reports arg parse failures', function() {
    fn = function(/* */ arg){};
    expect(function() { foam.types.getFunctionArgs(fn); }).toThrow();
  });
  it('reports return parse failures', function() {
    fn = function(/* */){};
    expect(function() { foam.types.getFunctionArgs(fn); }).toThrow();
  });
  it('parses no args', function() {
    fn = function(){};

    expect(function() { foam.types.getFunctionArgs(fn); }).not.toThrow();
  });
  it('fails a return before the last arg', function() {
    fn = function(arg1 /* RetType */, arg2){};

    expect(function() { foam.types.getFunctionArgs(fn); }).toThrow();
  });

});

describe('Argument.validate', function() {
  var fn;

  beforeEach(function() {
    fn = makeTestFn();
  });
  afterEach(function() {
    fn = null;
  });

  it('allows optional args to be omitted', function() {
    var params = foam.types.getFunctionArgs(fn);

    expect(function() { params[1].validate(undefined); }).not.toThrow();
    expect(function() { params[2].validate(undefined); }).toThrow();
  });
  it('checks modelled types', function() {
    var params = foam.types.getFunctionArgs(fn);

    expect(function() { params[0].validate(TypeA.create()); }).not.toThrow();
    expect(function() { params[1].validate(TypeB.create()); }).not.toThrow();
    expect(function() { params[1].validate(TypeBB.create()); }).not.toThrow(); //subclass should be ok
    expect(function() { params[2].validate(global['package.TypeC'].create()); }).not.toThrow();

    expect(function() { params[3].validate(TypeA.create()); }).not.toThrow(); // arg 3 not typed
    expect(function() { params[3].validate(99); }).not.toThrow();

    expect(function() { params.returnType.validate(RetType.create()); }).not.toThrow();
  });
  it('rejects wrong modelled types', function() {
    var params = foam.types.getFunctionArgs(fn);

    expect(function() { params[0].validate(TypeB.create()); }).toThrow();
    expect(function() { params[1].validate(TypeA.create()); }).toThrow();
    expect(function() { params[2].validate(RetType.create()); }).toThrow();

    expect(function() { params.returnType.validate(global['package.TypeC'].create()); }).toThrow();
  });
  it('checks primitive types', function() {
    var params = foam.types.getFunctionArgs(makePrimitiveTestFn());

    // /* string */ str, /*boolean*/ bool , /* function*/ func, /*object*/obj, /* number */num
    expect(function() { params[0].validate('hello'); }).not.toThrow();
    expect(function() { params[1].validate(true); }).not.toThrow();
    expect(function() { params[2].validate(function() {}); }).not.toThrow();
    expect(function() { params[3].validate({}); }).not.toThrow();
    expect(function() { params[4].validate(86); }).not.toThrow();
    expect(function() { params[5].validate(['hello']); }).not.toThrow();
  });
  it('rejects wrong primitive types', function() {
    var params = foam.types.getFunctionArgs(makePrimitiveTestFn());

    // /* string */ str, /*boolean*/ bool , /* function*/ func, /*object*/obj, /* number */num
    expect(function() { params[0].validate(78); }).toThrow();
    expect(function() { params[1].validate('nice'); }).toThrow();
    expect(function() { params[2].validate({}); }).toThrow();
    expect(function() { params[3].validate(function() {}); }).toThrow();
    expect(function() { params[4].validate(false); }).toThrow();
    expect(function() { params[5].validate({}); }).toThrow();
  });

  it('parses empty args list with tricky function body', function() {
    var params = foam.types.getFunctionArgs(function() { (3+4); return (1); });

    // /* string */ str, /*boolean*/ bool , /* function*/ func, /*object*/obj, /* number */num
    expect(function() { params[0].validate(78); }).toThrow();
    expect(function() { params[1].validate('nice'); }).toThrow();
    expect(function() { params[2].validate({}); }).toThrow();
    expect(function() { params[3].validate(function() {}); }).toThrow();
    expect(function() { params[4].validate(false); }).toThrow();
    expect(function() { params[5].validate({}); }).toThrow();
  });

});


describe('foam.types.typeCheck', function() {
  var fn;
  var orig;

  beforeEach(function() {
    orig = makeTestFn();
    fn = foam.types.typeCheck(orig);
  });
  afterEach(function() {
    fn = null;
  });

  it('allows valid args', function() {
    expect(function() { fn(TypeA.create(), TypeB.create(), global['package.TypeC'].create(), 99); }).not.toThrow();
  });
  it('allows extra args', function() {
    expect(function() {
        fn(TypeA.create(), TypeB.create(), global['package.TypeC'].create(), 99,
          "extra", 8, 'arg');
    }).not.toThrow();
  });
  it('fails missing args', function() {
    expect(function() { fn(TypeA.create(), TypeB.create()); }).toThrow();
  });
  it('fails bad primitive args', function() {
    expect(function() {
      fn(TypeA.create(), 3, global['package.TypeC'].create(), 99);
    }).toThrow();
  });
  it('fails bad model args', function() {
    expect(function() {
      fn(TypeA.create(), TypeB.create(), TypeA.create(), 99);
    }).toThrow();
  });

  it('fails bad return type', function() {
   var rfn = foam.types.typeCheck(function(arg /* object */) { return arg; });
   expect(function() { rfn({}); }).not.toThrow();
   expect(function() { rfn(99); }).toThrow();
  });
  it('covers no return type', function() {
   var rfn = foam.types.typeCheck(function() { return 1; });
   expect(function() { rfn({}); }).not.toThrow();
  });
  it('does not affect the toString() of the function', function() {
    expect(orig.toString()).toEqual(fn.toString());
  });

  it('supports repeating the last arg', function() {
    var f = function(/* string* */ arg /* string */) {
      return Array.from(arguments).join(', ');
    };
    var checked = foam.types.typeCheck(f);

    var out;
    expect(function() {
      out = checked('a', 'b', 'c');
    }).not.toThrow();
    expect(out).toBe('a, b, c');
  });
});

describe('Model validation', function() {
  it('warns if you supply both "extends" and "refines"', function() {
    expect(function() {
      foam.CLASS({
        package: 'test.model.validation',
        name: 'ExtendRefine',
        extends: 'foam.core.Property',
        refines: 'foam.core.Model'
      });
    }).toThrow();
  });

  it('warns if you provide mutually exclusive Property properties', function() {
    var cap = global.captureWarn();

    foam.CLASS({
      package: 'test.model.validation',
      name: 'Shadowing',
      properties: [
        {
          name: 'someProp',
          adapt: function(old, nu) { return nu + '_'; },
          setter: function(nu) { this.instance_ = nu; }
        }
      ]
    });

    var warnings = cap();
    expect(warnings.length).toBe(1);
    expect(warnings[0]).toBe(
      'Property test.model.validation.Shadowing.someProp "adapt" hidden ' +
      'by "setter"');
  });

  it('passes even if the SHADOW_MAP is disabled', function() {
    var old = foam.core.Property.SHADOW_MAP;
    foam.core.Property.SHADOW_MAP = null;

    expect(function() {
      foam.CLASS({
        package: 'test.model.validation',
        name: 'Shadowing2',
        properties: [
          {
            name: 'someProp',
            adapt: function(old, nu) { return nu + '_'; },
            setter: function(nu) { this.instance_ = nu; }
          }
        ]
      });
    }).not.toThrow();

    foam.core.Property.SHADOW_MAP = old;
  });

  it('should handle anonymous one-shot axioms', function() {
    expect(function() {
      foam.CLASS({
        package: 'test.model.validation',
        name: 'Parent',
        properties: [ 'someProp' ]
      });

      foam.CLASS({
        package: 'test.model.validation',
        name: 'Child',
        axioms: [
          {
            name: 'someProp'
          }
        ]
      });

      var obj = foam.lookup('test.model.validation.Child').create();
    }).not.toThrow();
  });

  it('should handle anonymous one-shot axioms being overridden', function() {
    expect(function() {
      foam.CLASS({
        package: 'test.model.validation',
        name: 'Parent2',
        axioms: [ { name: 'someAxiom' } ]
      });
      foam.CLASS({
        package: 'test.model.validation',
        name: 'Child2',
        extends: 'test.model.validation.Parent2',
        axioms: [ { name: 'someAxiom' } ]
      });

      var obj = foam.lookup('test.model.validation.Child2').create();
    }).not.toThrow();
  });
});

describe('FObject.describe', function() {
  it('emits a "-" as the value if the getter throws an error', function() {
    foam.CLASS({
      package: 'test.description',
      name: 'GetterThrow',
      properties: [
        {
          name: 'badGetter',
          getter: function() { throw 'Error!'; }
        }
      ]
    });

    var closeLog = captureLog();

    var x = test.description.GetterThrow.create();
    expect(function() { x.describe(); }).not.toThrow();

    var output = closeLog();
    var row = matchingLine(output, 'badGetter');
    expect(row.substring(row.length - 2)).toBe(' -');
  });

  it('does not emit hidden values', function() {
    foam.CLASS({
      package: 'test.description',
      name: 'HiddenValues',
      properties: [
        {
          name: 'someProp',
          hidden: true
        }
      ]
    });

    var closeLog = captureLog();

    var x = test.description.HiddenValues.create();
    expect(function() { x.describe(); }).not.toThrow();

    var output = closeLog();
    var row = matchingLine(output, 'someProp');
    expect(row.indexOf('-hidden-')).toBeGreaterThan(-1);
  });

  it('should handle Array and FObject values', function() {
    foam.CLASS({
      package: 'test.description',
      name: 'FancyValues',
      properties: [
        {
          name: 'arrayProp'
        },
        {
          name: 'objProp'
        }
      ]
    });

    var closeLog = captureLog();
    var x = test.description.FancyValues.create({
      arrayProp: [ 1, 2, 3 ],
      objProp: foam.mlang.LabeledValue.create({
        id: 1,
        label: 'fancy object',
        value: 7
      })
    });

    expect(function() { x.describe(); }).not.toThrow();

    var output = closeLog();
    var row = matchingLine(output, 'arrayProp');
    expect(row.indexOf('1,2,3')).toBeGreaterThan(-1);

    row = matchingLine(output, 'objProp');
    expect(row.indexOf('foam.mlang.LabeledValue')).toBeGreaterThan(-1);
  });
});

describe('Context.describe', function() {
  it('should handle FObject-valued exports', function() {
    var X = foam.__context__.createSubContext({
      someKey: foam.mlang.LabeledValue.create({
        id: 1,
        label: 'fancy object',
        value: 7
      })
    });

    var closeLog = captureLog();
    X.describe();
    var output = closeLog();

    var row = matchingLine(output, 'someKey');
    expect(row).toBeDefined();
    expect(row.indexOf('LabeledValue')).toBeGreaterThan(-1);
  });
});

describe('Window.merged and Window.framed', function() {
  it('should have friendly toString() in debug mode', function() {
    var base = function() {
      console.log('listener fired');
    };

    var merged = foam.__context__.merged(base, 200);
    var mergedStr = merged.toString();
    expect(mergedStr.indexOf('MERGED(200')).toBe(0);
    expect(mergedStr.indexOf('listener fired')).toBeGreaterThan(0);

    var framed = foam.__context__.framed(base);
    var framedStr = framed.toString();
    expect(framedStr.indexOf('ANIMATE(')).toBe(0);
    expect(framedStr.indexOf('listener fired')).toBeGreaterThan(0);
  });
});
