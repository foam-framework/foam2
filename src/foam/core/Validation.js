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
      // TODO: make deprecated, makes i18n difficult
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
            errorString: `${this.label} should be at least ${this.minLength} character${this.minLength>1?'s':''}`
          });
        }

        if ( foam.Number.isInstance(this.maxLength) ) {
          a.push({
            args: [this.name],
            predicateFactory: function(e) {
              return e.LTE(foam.mlang.StringLength.create({ arg1: self }), self.maxLength);
            },
            errorString: `${this.label} should be at most ${this.maxLength} character${this.maxLength>1?'s':''}`
          });
        }

        if ( this.required && ! foam.Number.isInstance(this.minLength) ) {
          a.push({
            args: [this.name],
            predicateFactory: function(e) {
              return e.GTE(foam.mlang.StringLength.create({ arg1: self }), 1);
            },
            errorString: `${this.label} required`
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
        const PHONE_NUMBER_REGEX = /^(?:\+?)(999|998|997|996|995|994|993|992|991|990|979|978|977|976|975|974|973|972|971|970|969|968|967|966|965|964|963|962|961|960|899|898|897|896|895|894|893|892|891|890|889|888|887|886|885|884|883|882|881|880|879|878|877|876|875|874|873|872|871|870|859|858|857|856|855|854|853|852|851|850|839|838|837|836|835|834|833|832|831|830|809|808|807|806|805|804|803|802|801|800|699|698|697|696|695|694|693|692|691|690|689|688|687|686|685|684|683|682|681|680|679|678|677|676|675|674|673|672|671|670|599|598|597|596|595|594|593|592|591|590|509|508|507|506|505|504|503|502|501|500|429|428|427|426|425|424|423|422|421|420|389|388|387|386|385|384|383|382|381|380|379|378|377|376|375|374|373|372|371|370|359|358|357|356|355|354|353|352|351|350|299|298|297|296|295|294|293|292|291|290|289|288|287|286|285|284|283|282|281|280|269|268|267|266|265|264|263|262|261|260|259|258|257|256|255|254|253|252|251|250|249|248|247|246|245|244|243|242|241|240|239|238|237|236|235|234|233|232|231|230|229|228|227|226|225|224|223|222|221|220|219|218|217|216|215|214|213|212|211|210|98|95|94|93|92|91|90|86|84|82|81|66|65|64|63|62|61|60|58|57|56|55|54|53|52|51|49|48|47|46|45|44|43|41|40|39|36|34|33|32|31|30|27|20|7|1)?[0-9]{4,14}$/;
        return this.required
          ? [
              {
                args: [this.name],
                predicateFactory: function(e) {
                  return e.HAS(self);
                },
                errorString: 'Phone number required'
              },
              {
                args: [this.name],
                predicateFactory: function(e) {
                  return e.REG_EXP(self, PHONE_NUMBER_REGEX);
                },
                errorString: 'Invalid phone number'
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
