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

foam.CLASS({
  package: 'foam.core',
  name: 'ValidationPredicate',
  properties: [
    {
      name: 'predicateFactory'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate',
      expression: function(predicateFactory) {
        return predicateFactory ?
          predicateFactory(foam.mlang.ExpressionsSingleton.create()) :
          null;
      }
    },
    {
      class: 'StringArray',
      name: 'args'
    },
    {
      class: 'Function',
      name: 'jsFunc',
      expression: function(predicate, jsErr) {
        return function() {
          if ( ! predicate.f(this) ) return jsErr(this);
        };
      }
    },
    {
      class: 'String',
      name: 'errorString'
    },
    {
      class: 'Function',
      name: 'jsErr',
      expression: function(errorString) {
        return function() { return errorString; };
      }
    }
  ],
  methods: [
    function createErrorSlotFor(data) {
      return this.ExpressionSlot.create({
        args: this.args.map(a => data[a+'$']),
        code: this.jsFunc.bind(data)
      });
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'PropertyValidationRefinement',
  refines: 'foam.core.Property',

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.core.ValidationPredicate',
      name: 'validationPredicates'
    },
    {
      name: 'validateObj',
      expression: function(name, label, required, validationPredicates) {
        if ( validationPredicates.length ) {
          var args = Object.keys(validationPredicates
            .map(vp => vp.args)
            .flat()
            .reduce((map, a) => {
              map[a] = true;
              return map;
            }, {}));
          return [args, function() {
            for ( var i = 0 ; i < validationPredicates.length ; i++ ) {
              var vp = validationPredicates[i];
              if ( vp.jsFunc.bind(this)() ) return vp.jsErr.bind(this)();
            }
            return null;
          }];
        }
        return !required ? null : [[name],
          function() {
            return !this.hasOwnProperty(name) && (label + ' is required.');
          }]
      },
    },
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'StringPropertyValidationRefinement',
  refines: 'foam.core.String',
  properties: [
    'min',
    'max',
    {
      class: 'FObjectArray',
      of: 'foam.core.ValidationPredicate',
      name: 'validationPredicates',
      factory: function() {
        var a = [];
        if ( foam.Number.isInstance(this.min) ) {
          a.push({
            args: [this.name],
            predicate: {
              class: 'foam.mlang.predicate.RegExp',
              arg1: {
                class: 'foam.mlang.FObjectPropertyExpr',
                property: this.name
              },
              regExp: new RegExp('^.{'+this.min+',}$')
            },
            errorString: `${this.label} must be at least ${this.min} character${this.min>1?'s':''}`
          });
        }
        if ( foam.Number.isInstance(this.max) ) {
          a.push({
            args: [this.name],
            predicate: {
              class: 'foam.mlang.predicate.RegExp',
              arg1: {
                class: 'foam.mlang.FObjectPropertyExpr',
                property: this.name
              },
              regExp: new RegExp('^.{0,'+this.max+'}$')
            },
            errorString: `${this.label} must be at most ${this.max} character${this.max>1?'s':''}`
          });
        }
        return a;
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'FObjectPropertyValidationRefinement',
  refines: 'foam.core.FObjectProperty',
  properties: [
    {
      class: 'Boolean',
      name: 'autoValidate'
    },
    {
      name: 'validateObj',
      expression: function(autoValidate, name, label, required) {
        if ( autoValidate ) {
          return [
            [`${name}$errors_`],
            function(errs) {
              return errs ? label + ' is invalid.' : null;
            }
          ];
        }
        return !required ? null : [[name],
          function() {
            return !this.hasOwnProperty(name) && (label + ' is required.');
          }]
      },
    },
  ]
});


foam.CLASS({
  package: 'foam.core.internal',
  name: 'Errors',
//  extends: 'foam.core.Property',

  documentation: `
    A psedo-Property Axiom added to FObject which contains an object\'s validation errors.
    Adds the following attributes to an Object:
    <dl>
      <dt>errors_</dt><dd>list of current errors</dd>
      <dt>errors_$</dt><dd>Slot representation of errors_</dd>
      <dt>validateObject()</dt><dd>calls the validateObj() method of all property Axioms, allowing them to populate errors_</dd>
    </dl>
  `,

  properties: [
    [ 'name', 'errors_' ]
  ],

  methods: [
    function installInProto(proto) {
      var self = this;
      Object.defineProperty(proto, 'errors_', {
        get: function() {
          return self.toSlot(this).get();
        },
        configurable: true,
        enumerable: false
      });

      Object.defineProperty(proto, 'errors_$', {
        get: function() {
          return self.toSlot(this);
        },
        configurable: true,
        enumerable: false
      });
    },

    function toSlot(obj) {
      var slotName = this.slotName_ || ( this.slotName_ = this.name + '$' );
      var slot     = obj.getPrivate_(slotName);

      if ( ! slot ) {
        slot = this.createErrorSlot_(obj)
        obj.setPrivate_(slotName, slot);
      }

      return slot;
    },

    function createErrorSlot_(obj) {
      var args = [];
      var ps   = obj.cls_.getAxiomsByClass(foam.core.Property).
        filter(function(a) { return a.validateObj; });

      for ( var i = 0 ; i < ps.length ; i++ ) {
        var p = ps[i];
        args.push(obj.slot(p.validateObj));
      }

      function validateObject() {
        var ret;

        for ( var i = 0 ; i < ps.length ; i++ ) {
          var p = ps[i];
          var err = args[i].get();
          if ( err ) (ret || (ret = [])).push([p, err]);
        }

        return ret;
      }

      return foam.core.ExpressionSlot.create({
        obj: obj,
        code: validateObject,
        args: args});
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'ValidationFObjectRefinement',
  refines: 'foam.core.FObject',

  axioms: [
    foam.core.internal.Errors.create()
  ]
});
