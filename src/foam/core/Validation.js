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
  name: 'PropertyValidationRefinement',
  refines: 'foam.core.Property',

  properties: [
    {
      name: 'validateObj',
      expression: function(name, label, required) {
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
