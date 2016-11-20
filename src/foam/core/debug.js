/*
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

/*
 * Debug.js
 *
 * This file contains refinements and replacements designed to make
 * FOAM apps easier to debug. Things like more informative toString() methods
 * .describe() on various types of objects, extra type checking, warnings,
 * and asserts, etc. Many of these features may negatively affect performance,
 * so while this file should be loaded during your day-to-day development,
 * it should not be included in production.
 */

/* Validating a Model should also validate all of its Axioms. */
foam.CLASS({
  refines: 'foam.core.Model',

  methods: [
    function validate() {
      this.SUPER();

      if ( this.hasOwnProperty('extends') && this.refines )
        throw this.id + ': "extends" and "refines" are mutually exclusive.';

      for ( var i = 0 ; i < this.axioms_.length ; i++ )
        this.axioms_[i].validate && this.axioms_[i].validate(this);
    }
  ]
});


/* Validate that Listeners aren't both framed and merged. */
foam.CLASS({
  refines: 'foam.core.Listener',

  methods: [
    function validate() {
      this.assert(
        ! this.isMerged || ! this.isFramed,
        "Listener can't be both isMerged and isFramed: ",
        this.name);
    }
  ]
});


/* Validating a Model should also validate all of its Axioms. */
foam.CLASS({
  refines: 'foam.core.Property',

  methods: [
    function validate(model) {
      this.SUPER();

      this.assert(
          ! this.name.endsWith('$'),
          'Illegal Property Name: Can\'t end with "$": ', this.name);

      var mName =
        model.id      ? model.id + '.'      :
        model.refines ? model.refines + '.' :
        '' ;

      var es = foam.core.Property.SHADOW_MAP || {};
      for ( var key in es ) {
        var e = es[key];
        if ( this[key] ) {
          for ( var j = 0 ; j < e.length ; j++ ) {
            if ( this.hasOwnProperty(e[j]) ) {
              console.warn(
                  'Property ' + mName +
                  this.name + ' "' + e[j] +
                  '" hidden by "' + key + '"');
            }
          }
        }
      }
    },

    function validateClass(cls) {
      // Validate that expressions only depend on known Axioms with Slots
      if ( this.expression ) {
        var expression = this.expression;
        var pName = cls.id + '.' + this.name + '.expression: ';

        var argNames = foam.Function.formalArgs(expression);
        for ( var i = 0 ; i < argNames.length ; i++ ) {
          var name  = argNames[i];
          var axiom = cls.getAxiomByName(name);

          this.assert(
              axiom,
              'Unknown argument "', name, '" in ', pName, expression);
          this.assert(
              axiom.toSlot,
              'Non-Slot argument "', name, '" in ', pName, expression);
        }
      }
    }
  ]
});


foam.__context__.assert(
    ! foam.core.FObject.describe,
    'foam.core.FObject.describe already set.');

/* Add describe() support to classes. */
foam.core.FObject.describe = function(opt_name) {
  console.log('CLASS:  ', this.name);
  console.log('extends:', this.model_.extends);
  console.log('Axiom Type           Source Class   Name');
  console.log('----------------------------------------------------');
  for ( var key in this.axiomMap_ ) {
    var a = this.axiomMap_[key];
    console.log(
      foam.String.pad(a.cls_ ? a.cls_.name : 'anonymous', 20),
      foam.String.pad(a.sourceCls_.name, 14),
      a.name);
  }
  console.log('\n');
};


// Decorate installModel() to verify that axiom names aren't duplicated.
foam.core.FObject.installModel = function() {
  var superInstallModel = foam.core.FObject.installModel;

  return function(m) {
    var names = {};

    for ( var i = 0 ; i < m.axioms_.length ; i++ ) {
      var a = m.axioms_[i];

      foam.__context__.assert(
        ! names.hasOwnProperty(a.name),
        'Axiom name conflict in', m.id || m.refines, ':', a.name);

      var prevA    = this.getAxiomByName(a.name);
      var Property = foam.core.Property;
      // Potential failure if:
      //    previousAxiom class does not match newAxiom class
      // But ignore valid cases:
      //    base Property extended by subclass of Property
      //    subclass of Property extended without specifying class
      if (  prevA && prevA.cls_ !== a.cls_ &&
          ! ( prevA.cls_ === Property && Property.isSubClass(a.cls_) ) &&
          ! ( Property.isSubClass(prevA.cls_) && a.cls_ === Property )
      ) {
        var prevCls = prevA.cls_ ? prevA.cls_.id : 'anonymous';
        var aCls    = a.cls_     ? a.cls_.id     : 'anonymous';

        if ( Property.isSubClass(prevA.cls_) && ! Property.isSubClass(a.cls_) ) {
          throw 'Illegal to change Property to non-Property: ' +
            this.id + '.' +
            a.name +
            ' changed to ' +
            aCls;
        } else if ( foam.core.Method.isSubClass(prevA.cls_) && foam.core.Method.isSubClass(a.cls_) ) {
          // NOP
        } else if ( prevA.cls_ ) {
          // FUTURE: make error when supression supported
          console.warn(
              'Change of Axiom ' +
              this.id + '.' +
              a.name +
              ' type from ' +
              prevCls +
              ' to ' +
              aCls);
        }
      }

      names[a.name] = a;
    }

    superInstallModel.call(this, m);
  };
}();

foam.core.FObject.validate = function() {
  for ( var key in this.axiomMap_ ) {
    var a = this.axiomMap_[key];
    a.validateClass && a.validateClass(this);
  }
}

// Change 'false' to 'true' to enable error reporting for setting
// non-Properties on FObjects.
// TODO: add 'Did you mean...' support.
if ( false && global.Proxy ) {
  (function() {

    var IGNORE = {
      oldValue: true,
      SUPER: true,
      obj: true,
      private_: true,
      prop: true,
      slotName_: true,
      sourceCls_: true,
      value: true
    };

    var oldCreate = foam.core.FObject.create;

    foam.core.FObject.create = function(args, ctx) {
      return new Proxy(oldCreate.call(this, args, ctx), {
        get: function(target, prop, receiver) {
          return Reflect.get(target, prop, receiver);
        },
        set: function(target, prop, value, receiver) {
          foam.__context__.assert(
              IGNORE[prop] || target.cls_.getAxiomByName(
                prop.endsWith('$') ? prop.substring(0, prop.length-1) : prop),
              'Invalid Set: ', target.cls_.id, prop, value);
          Reflect.set(target, prop, value, receiver);
          return true;
        }
      });
    };
  })();
}


/* Add describe() support to objects. */
foam.CLASS({
  refines: 'foam.core.FObject',

  methods: [
    function unknownArg(key, value) {
      if ( key == 'class' ) return;
      this.warn('Unknown property ' + this.cls_.id + '.' + key + ': ' + value);
    },

    function describe(opt_name) {
      this.log('Instance of', this.cls_.name);
      this.log('Axiom Type           Name           Value');
      this.log('----------------------------------------------------');
      var ps = this.cls_.getAxiomsByClass(foam.core.Property);
      for ( var i = 0 ; i < ps.length ; i++ ) {
        var p = ps[i];
        var value;
        try {
          value = p.hidden ? '-hidden-' : this[p.name];
        } catch (x) {
          value = '-';
        }
        if ( foam.Array.isInstance(value) ) {
          // NOP
        } else if ( value && value.toString ) {
          value = value.toString();
        }
        console.log(
          foam.String.pad(p.cls_ ? p.cls_.name : 'anonymous', 20),
          foam.String.pad(p.name, 14),
          value);
      }
      this.log('\n');
    }
  ]
});


/* Add describe support to contexts. */
foam.__context__ = foam.__context__.createSubContext({
  describe: function() {
    this.log(
        'Context:',
        this.hasOwnProperty('NAME') ? this.NAME : ('anonymous ' + this.$UID));
    this.log('KEY                  Type           Value');
    this.log('----------------------------------------------------');
    for ( var key in this ) {
      var value = this[key];
      var type = foam.core.FObject.isInstance(value) ?
          value.cls_.name :
          typeof value    ;
      this.log(
        foam.String.pad(key,  20),
        foam.String.pad(type, 14),
        typeof value === 'string' || typeof value === 'number' ? value : '');
    }
    this.log('\n');
}});


foam.CLASS({
  package: 'foam.debug',
  name: 'Window',

  documentation: 'Decorated merged() and framed() to have debug friendly ' +
      'toString() methods.',

  exports: [ 'merged', 'framed' ],

  methods: [
    function merged(l, opt_delay) {
      var f = this.__context__.merged(l, opt_delay);
      f.toString = function() {
        return 'MERGED(' + opt_delay + ', ' + listener.$UID + ', ' + listener + ')';
      };
      return f;
    },
    function framed(l) {
      var f = this.__context__.framed(l);
      f.toString = function() {
        return 'ANIMATE(' + l.$UID + ', ' + l + ')';
      };
      return f;
    }
  ]
});

foam.__context__ = foam.debug.Window.create(null, foam.__context__).__subContext__;


/** Describes one argument of a function or method. */
foam.CLASS({
  package: 'foam.core',
  name: 'Argument',

  constants: {
    PREFIX: 'Argument',
  },

  properties: [
    {
      /** The name of the argument */
      name: 'name'
    },
    {
      /**
        The string name of the type
        (either a model name or javascript typeof name)
      */
      name: 'typeName'
    },
    {
      /** If set, this holds the actual Model represented by typeName. */
      name: 'type'
    },
    {
      /** If true, indicates that this argument is optional. */
      name: 'optional', value: false
    },
    {
      /** If true, indicates a variable number of arguments. */
      name: 'repeats', value: false
    },
    {
      /** The index of the argument (the first argument is at index 0). */
      name: 'index', value: -1
    },
    {
      /** The documentation associated with the argument (denoted by a // ) */
      name: 'documentation', value: ''
    }
  ],

  methods: [
    /**
      Validates the given argument against this type information.
      If any type checks are failed, a TypeError is thrown.
     */
    function validate(/* any // the argument value to validate. */ arg) {
      i = ( this.index >= 0 ) ? ' ' + this.index + ', ' : ', ';

      // optional check
      if ( ( ! arg ) && typeof arg === 'undefined' ) {
        if ( ! this.optional ) {
          throw new TypeError(
              this.PREFIX + i + this.name +
              ', is not optional, but was undefined in a function call');
        } else {
          return; // value is undefined, but ok with that
        }
      }

      // type this for non-modelled types (no model, but a type name specified)
      if ( ! this.type ) {
        if ( this.typeName
            && typeof arg !== this.typeName
            && ! ( this.typeName === 'array' && Array.isArray(arg) ) ) {
          throw new TypeError(
              this.PREFIX + i + this.name +
              ', expected type ' + this.typeName + ' but passed ' + (typeof arg));
        } // else no this: no type, no typeName
      } else {
        // have a modelled type
        if ( ! this.type.isInstance(arg) ) {
          var gotType = (arg.cls_) ? arg.cls_.name : typeof arg;
          throw new TypeError(
              this.PREFIX + i + this.name +
              ', expected type ' + this.typeName + ' but passed ' + gotType);
        }
      }
    }
  ]
});


/** Describes a function return type. */
foam.CLASS({
  package: 'foam.core',
  name: 'ReturnValue',
  extends: 'foam.core.Argument',

  constants: {
    PREFIX: 'Return'
  }
});


/** The types library deals with type safety. */
foam.LIB({
  name: 'foam.types',

  methods: [
    function getFunctionArgs(fn) {
      /** Extracts the arguments and their types from the given function.
        * @arg fn The function to extract from. The toString() of the function
        *     must be accurate.
        * @return An array of Argument objects.
        */
      // strip newlines and find the function(...) declaration
      var args = foam.Function.argsStr(fn);
      if ( ! args ) return [];
      args += ','; // easier matching

      var ret = [];
      // check each arg for types
      // Optional commented type(incl. dots for packages), argument name,
      // optional commented return type
      // ws [/* ws package.type? ws */] ws argname ws [/* ws retType ws */]
      //console.log('-----------------');
      var argIdx = 0;
      var argMatcher = /(\s*\/\*\s*([\w._$]+)(\?)?(\*)?\s*(\/\/\s*(.*?))?\s*\*\/)?\s*([\w_$]+)\s*(\/\*\s*([\w._$]+)\s*\*\/)?\s*\,+/g;
      var typeMatch;
      while ( typeMatch = argMatcher.exec(args) ) {
        // if can't match from start of string, fail
        if ( argIdx == 0 && typeMatch.index > 0 ) break;

        if ( ret.returnType ) {
          throw new SyntaxError("foam.types.getFunctionArgs return type '" +
            ret.returnType.typeName +
            "' must appear after the last argument only: " + args.toString());
        }

        // record the argument
        ret.push(foam.core.Argument.create({
          name:          typeMatch[7],
          typeName:      typeMatch[2],
          type:          global[typeMatch[2]],
          optional:      typeMatch[3] == '?',
          repeats:       typeMatch[3] == '*',
          index:         argIdx++,
          documentation: typeMatch[6],
        }));
        // if present, record return type (if not the last arg, we fail on the
        // next iteration)
        if ( typeMatch[9] ) {
          ret.returnType = foam.core.ReturnValue.create({
            typeName: typeMatch[9],
            type: global[typeMatch[9]]
          });
        }
      }
      if ( argIdx == 0 ) {
        // check for bare return type with no args
        typeMatch = args.match(/^\s*\/\*\s*([\w._$]+)\s*\*\/\s*/);
        if ( typeMatch && typeMatch[1] ) {
          ret.returnType = foam.core.ReturnValue.create({
            typeName: typeMatch[1],
            type: global[typeMatch[1]]
          });
        } else {
          throw new SyntaxError(
              'foam.types.getFunctionArgs argument parsing error: ' +
              args.toString());
        }
      }

      return ret;
    },

    /** Decorates the given function with a runtime type checker.
      * Types should be denoted before each argument:
      * <code>function(\/\*TypeA\*\/ argA, \/\*string\*\/ argB) { ... }</code>
      * Types are either the names of Models (i.e. declared with CLASS), or
      * javascript primitives as returned by 'typeof'. In addition, 'array'
      * is supported as a special case, corresponding to an Array.isArray()
      * check.
      * @fn The function to decorate. The toString() of the function must be
      *     accurate.
      * @return A new function that will throw errors if arguments
      *         doesn't match the declared types, run the original function,
      *         then type check the returned value.
      */
    function typeCheck(fn) {
      // parse out the arguments and their types
      var args = foam.types.getFunctionArgs(fn);
      var ret = function() {
        // check each declared argument, arguments[i] can be undefined for
        // missing optional args, extra arguments are ok
        for ( var i = 0 ; i < args.length ; i++ )
          args[i].validate(arguments[i]);

        // if last arg repeats, validate remaining arguments against lastArg
        var lastArg = args[args.length - 1];
        if ( lastArg && lastArg.repeats ) {
          for ( var i = args.length ; i < arguments.length ; i++ ) {
            lastArg.validate(arguments[i]);
          }
        }

        // If nothing threw an exception, we are free to run the function
        var retVal = fn.apply(this, arguments);

        // check the return value
        if ( args.returnType ) args.returnType.validate(retVal);

        return retVal;
      }

      // keep the old value of toString (hide the decorator)
      ret.toString = function() { return fn.toString(); }

      return ret;
    }
  ]
});

foam.core.Import;

foam.CLASS({
  refines: 'foam.core.FObject',

  documentation: 'Assert that all required imports are provided.',

  methods: [
    function init() {
      var is = this.cls_.getAxiomsByClass(foam.core.Import);
      for ( var i = 0 ; i < is.length ; i++ ) {
        var imp = is[i];

        if ( imp.required && ! this.__context__[imp.key + '$'] ) {
          var m = 'Missing required import: ' + imp.key + ' in ' + this.cls_.id;
          this.assert(false, m);
        }
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Import',

  properties: [
    {
      name: 'name',
      assertValue: function(n) {
        if ( ! /^[a-zA-Z][a-zA-Z0-9_]*?$/.test(n) ) {
          var m = 'Import name "' + n + '" must be a valid variable name.';
          if ( n.indexOf('.') !== -1 ) m += ' Did you mean requires:?';

          this.assert(false, m);
        }
      }
    }
  ],

  methods: [
    function installInClass(c) {
      // Produce warning for duplicate imports
      if ( c.getSuperAxiomByName(this.name) ) {
        this.warn(
          'Import "' + this.name + '" already exists in ancestor class of ' +
          c.id + '.');
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Export',

  properties: [
    {
      name: 'name',
      assertValue: function(n) {
        if ( ! /^[a-zA-Z][a-zA-Z0-9_]*?$/.test(n) ) {
          var m = 'Export name "' + n + '" must be a valid variable name.';
          this.assert(false, m);
        }
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.FObject',

  documentation: '.',

  methods: [
    function describeListeners() {
      var self  = this;
      var count = 0;
      function show(ls, path) {
        var next = ls.next;
        for ( var next = ls.next ; next ; next = next.next ) {
          count++;
          self.log(path, {l:next.l});
        }

        for ( var key in ls.children ) {
          show(ls.children[key], path ? path + '.' + key : key);
        }
      }

      show(this.getPrivate_('listeners'));
      this.log(count, 'subscriptions');
    }
  ]
});
