/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

/**
  Set a specified properties value with an auto-increment
  sequence number on DAO.put() if the properties value
  is set to the properties default value.
*/
foam.CLASS({
  package: 'foam.dao',
  name: 'SequenceNumberDAO',
  extends: 'foam.dao.ProxyDAO',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.dao.InternalException'
  ],


  properties: [
    {
      class: 'String',
      name: 'property',
      value: 'id'
    },
    {
      class: 'Int',
      name: 'value',
      value: 1
    },
    { /** Returns a promise that fulfills when the maximum existing number
          has been found and assigned to this.value */
      name: 'calcDelegateMax_',
      hidden: true,
      expression: function(delegate, property) {
        // TODO: validate property self.of[self.property.toUpperCase()]
        var self = this;
        return self.delegate.select(
          self.MAX(self.property_)
        ).then(
          function(max) {
            if ( max.value ) self.value = max.value + 1;
          }
        );
      }
    },
    {
      name: 'property_',
      hidden: true,
      expression: function(property, of) {
        var a = this.of$cls.getAxiomByName(property);
        if ( ! a ) {
          throw this.InternalException.create({message:
              'SequenceNumberDAO specified with invalid property ' +
              property + ' for class ' + this.of
          });
        }
        return a;
      }
    }
  ],

  methods: [
    function put(obj, sink) {
      var self = this;
      return this.calcDelegateMax_.then(function() {
        var val = self.property_.f(obj);

        if ( ! val || val == self.property_.value ) {
          obj[self.property_.name] = self.value++;
        }

        return self.delegate.put(obj, sink);
      });
    }
  ]
});
