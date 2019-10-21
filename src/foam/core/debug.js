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

// Set a global flag so that code we are not able to patch can still do some debugging thigns.
foam._IS_DEBUG_ = true;

/* Validating a Model should also validate all of its Axioms. */
foam.CLASS({
  package: 'foam.core',
  name: 'ModelSourceRefinement',
  refines: 'foam.core.Model',
  flags: [ 'debug' ],

  properties: [
    {
      name: 'source',
      transient: true
    }
  ],

  methods: [
    function validate() {
      this.SUPER();

      if ( this.refines ) {
        if ( this.hasOwnProperty('extends') ) {
          throw this.id + ': "extends" and "refines" are mutually exclusive.';
        }
      }

      for ( var i = 0 ; i < this.axioms_.length ; i++ ) {
        this.axioms_[i].validate && this.axioms_[i].validate(this);
      }
    }
  ]
});


/* Validate that Listeners aren't both framed and merged. */
foam.CLASS({
  package: 'foam.core',
  name: 'ListenerValidateRefinement',
  refines: 'foam.core.Listener',
  flags: [ 'debug' ],

  methods: [
    function validate() {
      foam.assert(
        ! this.isMerged || ! this.isFramed,
        "Listener can't be both isMerged and isFramed: ",
        this.name);
    }
  ]
});


/* Validating a Model should also validate all of its Axioms. */
foam.CLASS({
  package: 'foam.core',
  name: 'PropertyValidateRefinement',
  refines: 'foam.core.Property',
  flags: [ 'debug' ],

  properties: [
    {
      name: 'source',
      transient: true
    }
  ],

  methods: [
    function validate(model) {
      this.SUPER();

      foam.assert(
          ! this.name.endsWith('$'),
          'Illegal Property Name: Can\'t end with "$": ', this.name);

      var mName;

      var es = foam.core.Property.SHADOW_MAP || {};
      for ( var key in es ) {
        var e = es[key];
        if ( this[key] ) {
          for ( var j = 0 ; j < e.length ; j++ ) {
            if ( this.hasOwnProperty(e[j]) ) {
              if ( ! mName ) {
                mName = model.id      ? model.id      + '.' :
                        model.refines ? model.refines + '.' :
                        '' ;
              }

              var source = this.source;
              this.__context__.warn(
                  (source ? source + ' ' : '') +
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

        var argNames = foam.Function.breakdown(expression).args.map(function(a) {
          return a.split('$').shift();
        });

        for ( var i = 0 ; i < argNames.length ; i++ ) {
          var name  = argNames[i];
          var axiom = cls.getAxiomByName(name);

          foam.assert(
              axiom,
              'Unknown argument ', name, ' in ', pName, expression);
          foam.assert(
              axiom.toSlot,
              'Non-Slot argument ', name, ' in ', pName, expression);
        }
      }
    }
  ]
});


foam.SCRIPT({
  package: 'foam.core',
  name: 'DebugScript',
  flags: [ 'debug' ],
  code: function() {
  /* Add describe() support to classes. */
  foam.core.FObject.describe = function(opt_name) {
    console.log('CLASS:  ', this.name);
    console.log('extends:', this.model_.extends);
    console.log('Axiom Type           Source Class   Name                 Source Path');
    console.log('-------------------------------------------------------------------------------------------------');
    for ( var key in this.axiomMap_ ) {
      var a = this.axiomMap_[key];
      console.log(
        foam.String.pad(a.cls_ ? a.cls_.name : 'anonymous', 20),
        foam.String.pad((a.sourceCls_ && a.sourceCls_.name) || 'unknown', 14),
        foam.String.pad(a.name, 20),
        a.source || '');
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

        foam.assert(
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
                aCls +
                ' in model ' +
                m.id);
          }
        }

        names[a.name] = a;
      }

      superInstallModel.call(this, m);
    };
  }();

  foam.core.FObject.validate = function() {
    // TODO: Why doesn't this call super or also validateInstance?
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
        oldValue:   true,
        SUPER:      true,
        obj:        true,
        private_:   true,
        prop:       true,
        slotName_:  true,
        sourceCls_: true,
        value:      true
      };

      var oldCreate = foam.core.FObject.create;

      foam.core.FObject.create = function(args, ctx) {
        return new Proxy(oldCreate.call(this, args, ctx), {
          get: function(target, prop, receiver) {
            return Reflect.get(target, prop, receiver);
          },
          set: function(target, prop, value, receiver) {
            foam.assert(
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
}});


/* Add describe() support to objects. */
foam.CLASS({
  package: 'foam.core',
  name: 'FObjectDescribeRefinement',
  refines: 'foam.core.FObject',
  flags: [ 'debug' ],

  methods: [
    function unknownArg(key, value) {
      if ( key == 'class' ) return;
      this.__context__.warn('Unknown property ' + this.cls_.id + '.' + key + ': ' + value);
    },

    function describe(opt_name) {
      this.__context__.log('Instance of', this.cls_.name);
      this.__context__.log('Axiom Type           Name           Value');
      this.__context__.log('----------------------------------------------------');
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
      this.__context__.log('\n');
    }
  ]
});


foam.SCRIPT({
  package: 'foam.core',
  name: 'DebugDescribeScript',
  flags: [ 'debug' ],
  code: function() {
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
  }
});


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


foam.SCRIPT({
  package: 'foam.core',
  name: 'DebugContextScript',
  requires: [ 'foam.debug.Window' ],
  flags: [ 'debug' ],
  code: function() {
    foam.__context__ = foam.debug.Window.create(null, foam.__context__).__subContext__;
  }
});


foam.SCRIPT({
  package: 'foam.core',
  name: 'DebugImportScript',
  code: function() {
    // Access Import now to avoid circular reference because of lazy model building.
    foam.core.Import;
  }
});


foam.CLASS({
  package: 'foam.core',
  name: 'FObjectValidateImportsRefinement',
  refines: 'foam.core.FObject',
  flags: [ 'debug' ],

  documentation: 'Assert that all required imports are provided.',

  methods: [
    function init() {
      var is = this.cls_.getAxiomsByClass(foam.core.Import);
      for ( var i = 0 ; i < is.length ; i++ ) {
        var imp = is[i];

        if ( imp.required && ! this.__context__[imp.key + '$'] ) {
          var m = 'Missing required import: ' + imp.key + ' in ' + this.cls_.id;
          foam.assert(false, m);
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'ImportValidationRefinement',
  refines: 'foam.core.Import',
  flags: [ 'debug' ],

  properties: [
    {
      name: 'name',
      assertValue: function(n) {
        if ( ! /^[a-zA-Z][a-zA-Z0-9_]*?$/.test(n) ) {
          var m = 'Import name "' + n + '" must be a valid variable name.';
          if ( n.indexOf('.') !== -1 ) m += ' Did you mean requires:?';

          foam.assert(false, m);
        }
      }
    }
  ],

  methods: [
    function installInClass(c, superImport) {
      // Produce warning for duplicate imports
      if ( superImport && superImport.equals(this) ) {
        this.__context__.warn(
          'Import "' + this.name + '" already exists in ancestor class of ' +
          c.id + '.');
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'FObjectDescribeListenersRefinement',
  refines: 'foam.core.FObject',
  flags: [ 'debug' ],

  documentation: 'Add describeListeners() method to FObject.',

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
      this.__context__.log(count, 'subscriptions');
    }
  ]
});


foam.LIB({
  name: 'foam.debug',

  methods: [
    function showCreates() {
      var lastCounts_ = this.lastCounts_ || ( this.lastCounts_ = {} );

      console.log('Class                                         Count      Delta');
      console.log('-----------------------------------------------------------------');
      for ( var key in foam.USED ) {
        var c = foam.USED[key];

        if ( c.count_ ) {
          var lc = lastCounts_[key] || 0;
          lastCounts_[key] = c.count_;
          console.log(
              foam.String.pad(c.id, 45),
              foam.String.pad(c.count_ + '', 10),
              c.count_-lc);
        }
      }
    }
  ]
});
