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
  package: 'foam.u2.search',
  name: 'GroupCompleter',
  extends: 'foam.u2.Autocompleter',

  requires: [
    'foam.dao.MDAO',
    'foam.dao.ProxyDAO',
    'foam.mlang.LabeledValue',
    'foam.mlang.predicate.ContainsIC'
  ],

  documentation: 'Expects "groups" to be an array of strings, and ' +
      'autocompletes on them.',

  properties: [
    'groups',
    {
      name: 'dao',
      factory: function() {
        return this.ProxyDAO.create({
          of: this.LabeledValue,
          delegate$: this.innerDAO_$
        });
      }
    },
    {
      name: 'innerDAO_',
      expression: function(groups) {
        var dao = this.MDAO.create({ of: this.LabeledValue });
        if ( ! groups || ! groups.length ) return dao;

        for ( var i = 0 ; i < groups.length ; i++ ) {
          var str = '' + groups[i];
          if ( ! str ) continue;
          dao.put(this.LabeledValue.create({
            id: str,
            label: str,
            value: groups[i]
          }));
        }
        return dao;
      }
    },
    {
      name: 'queryFactory',
      value: function(str) {
        return this.ContainsIC.create({
          arg1: this.LabeledValue.LABEL,
          arg2: str
        });
      }
    },
    {
      name: 'objToString',
      value: function(lv) {
        return lv.value;
      }
    }
  ]
});
