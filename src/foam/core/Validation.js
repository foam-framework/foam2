/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
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
      // TODO: it isn't normal for JS functions to have a 'js' prefix
      // TODO: poor choice of name, should be something with 'assert'
      name: 'jsFunc',
      expression: function(predicate, jsErr) {
        return function() {
          if ( ! predicate.f(this) ) return jsErr(this);
        };
      }
    },
    {
      class: 'String',
      name: 'errorMessage',
      documentation: `
        Provide feedback to the user via a Message.
        To use this, provide the name of the Message you wish to add.
        When both errorString and errorMessage are specified, the errorMessage will be used.
      `
    },
    {
      class: 'String',
      name: 'errorString',
      documentation: `
        Provide feedback to the user via a String.
        When both errorString and errorMessage are specified, the errorMessage will be used.
      `
    },
    {
      class: 'Function',
      // TODO: it isn't normal for JS functions to have a 'js' prefix
      name: 'jsErr',
      expression: function(errorString, errorMessage) {
        return function(obj) { 
          if ( errorMessage && obj ) {
            if ( obj[errorMessage] ) return obj[errorMessage];
            console.warn('Error finding message', errorMessage, '. No such message on object.', obj);
          }
          return errorString;
        }
      }
    }
  ],

  methods: [
    function createErrorSlotFor(data) {
      return data.slot(this.jsFunc, this.args);
      /*
      return this.ExpressionSlot.create({
        args: this.args.map(a => data[a+'$']),
        code: this.jsFunc.bind(data)
      });
      */
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
      name: 'validationPredicates',
      // We override 'compare' here because we need to avoid infinite recursion
      // that occurs when a validation predicate for a given property contains a
      // reference to the property itself.
      // This is an incorrect implementation of compare since it will always
      // return a match, even if the validation predicates are different. It
      // would be preferable to find a way to deal with circular references.
      compare: function() { return 0; }
    },
    {
      name: 'validateObj',
      expression: function(name, label, required, validationPredicates) {
        if ( validationPredicates.length ) {
          var args = foam.Array.unique(validationPredicates
            .map(vp => vp.args)
            .flat());
          return [args, function() {
            for ( var i = 0 ; i < validationPredicates.length ; i++ ) {
              var vp = validationPredicates[i];
              var self = this;
              if ( vp.jsFunc.bind(self)() ) return vp.jsErr.bind(self)(self);
            }
            return null;
          }];
        }
        return !required ? null : [[name],
          function() {
            const axiom = this.cls_.getAxiomByName(name);
            return axiom.isDefaultValue(this[name]) && (`Please enter ${label.toLowerCase()}`);
          }]
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'StringPropertyValidationRefinement',
  refines: 'foam.core.String',

  properties: [
    'minLength',
    'maxLength',
    {
      class: 'FObjectArray',
      of: 'foam.core.ValidationPredicate',
      name: 'validationPredicates',
      factory: function() {
        var self = this;
        var a    = [];

        if ( foam.Number.isInstance(this.minLength) ) {
          a.push({
            args: [this.name],
            predicateFactory: function(e) {
              return e.GTE(foam.mlang.StringLength.create({ arg1: self }), self.minLength);
            },
            errorString: `Please enter ${this.label.toLowerCase()} with at least ${this.minLength} character${this.minLength>1?'s':''}`
          });
        }

        if ( foam.Number.isInstance(this.maxLength) ) {
          a.push({
            args: [this.name],
            predicateFactory: function(e) {
              return e.LTE(foam.mlang.StringLength.create({ arg1: self }), self.maxLength);
            },
            errorString: `Please enter ${this.label.toLowerCase()} with at most ${this.maxLength} character${this.maxLength>1?'s':''}`
          });
        }

        if ( this.required && ! foam.Number.isInstance(this.minLength) ) {
          a.push({
            args: [this.name],
            predicateFactory: function(e) {
              return e.GTE(foam.mlang.StringLength.create({ arg1: self }), 1);
            },
            errorString: `Please enter ${this.label.toLowerCase()}`
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
      expression: function(name, label, required, validationPredicates, autoValidate) {
        if ( autoValidate ) {
          return [
            [`${name}$errors_`],
            function(errs) {
              return errs ? `Please enter valid ${label.toLowerCase()}` : null;
            }
          ];
        }
        return foam.core.Property.VALIDATE_OBJ.expression.apply(this, arguments);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'IntPropertyValidationRefinement',
  refines: 'foam.core.Int',

  properties: [
    {
      class: 'Boolean',
      name: 'autoValidate'
    },
    {
      name: 'validationPredicates',
      factory: function() {
        if ( ! this.autoValidate ) return [];
        var self = this;
        var a    = [];

        if ( foam.Number.isInstance(self.min) ) {
          a.push({
            args: [self.name],
            predicateFactory: function(e) {
              return e.GTE(self, self.min);
            },
            errorString: `Please enter ${self.label.toLowerCase()} greater than or equal to ${self.min}.`
          });
        }

        if ( foam.Number.isInstance(self.max) ) {
          a.push({
            args: [self.name],
            predicateFactory: function(e) {
              return e.LTE(self, self.max);
            },
            errorString: `Please enter ${self.label.toLowerCase()} less than or equal to ${self.max}`
          });
        }

        return a;
      }
    }
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
        args: args
      });
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


foam.CLASS({
  package: 'foam.core',
  name: 'EmailPropertyValidationRefinement',
  refines: 'foam.core.EMail',

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.core.ValidationPredicate',
      name: 'validationPredicates',
      factory: function() {
        var self = this;
        var ret = [
          {
            args: [this.name],
            predicateFactory: function(e) {
              return e.OR(
                e.EQ(self, ''),
                e.REG_EXP(self, /\S+@\S+\.\S+/)
              );
            },
            errorString: 'Please enter valid email address'
          }
        ];
        if ( this.required ) {
          ret.push(
            {
              args: [this.name],
              predicateFactory: function(e) {
                return e.NEQ(self, '');
              },
              errorString: 'Please enter email address'
            }
          );
        }
        return ret;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'PhoneNumberPropertyValidationRefinement',
  refines: 'foam.core.PhoneNumber',

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.core.ValidationPredicate',
      name: 'validationPredicates',
      factory: function() {
        var self = this;
        const PHONE_NUMBER_REGEX = /^(?:\+?1[-.●]?)?\(?([0-9]{3})\)?[-.●]?([0-9]{3})[-.●]?([0-9]{4})$/;
        return this.required
          ? [
              {
                args: [this.name],
                predicateFactory: function(e) {
                  return e.HAS(self);
                },
                errorString: 'Phone number required.'
              },
              {
                args: [this.name],
                predicateFactory: function(e) {
                  return e.REG_EXP(self, PHONE_NUMBER_REGEX);
                },
                errorString: 'Invalid phone number.'
              }
            ]
          : [
              {
                args: [this.name],
                predicateFactory: function(e) {
                    return e.OR(
                      e.EQ(foam.mlang.StringLength.create({ arg1: self }), 0),
                      e.REG_EXP(self, PHONE_NUMBER_REGEX)
                    );
                },
                errorString: 'Invalid phone number.'
              }
            ];
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'DatePropertyValidationRefinement',
  refines: 'foam.core.Date',

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.core.ValidationPredicate',
      name: 'validationPredicates',
      factory: function() {
        var self = this;
        return [
          {
            args: [self.name],
            predicateFactory: function(e) {
              return e.OR(
                e.NOT(e.HAS(self)), // Allow null dates.
                e.AND(
                  e.LTE(
                    self,
                    // Maximum date supported by FOAM
                    // (bounded by JavaScript's limit)
                    new Date(8640000000000000)
                  ),
                  e.GTE(
                    self,
                    // Minimum date supported by FOAM
                    // (bounded by JavaScript's limit)
                    new Date(-8640000000000000)
                  )
                )
              );
            },
            errorString: 'Invalid date value'
          }
        ];
      }
    }
  ]
});
