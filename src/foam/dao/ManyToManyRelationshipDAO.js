/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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
  package: 'foam.dao',
  name: 'ManyToManyRelationshipDAO',
  extends: 'foam.dao.ProxyDAO',

  implements: [ { path: 'foam.mlang.Expressions', java: false } ],

  documentation: 'Adapts a DAO based on a *:* Relationship.',

  properties: [
    {
      class: 'foam.core.Property',
      name: 'junctionProperty'
    },
    {
      class: 'foam.core.String',
      name: 'junctionDAOKey'
    },
    'junctionCls',
    {
      class: 'foam.core.Property',
      name: 'sourceKey'
    },
    {
      class: 'foam.core.Property',
      name: 'targetProperty'
    },
    {
      class: 'foam.core.Property',
      name: 'sourceProperty'
    },
    'junctionKeyFactory',
    {
      class: 'foam.core.Boolean',
      name: 'junctionFactoryPreOrder'
    },
    {
      name: 'junctionDAO',
      getter: function() {
        return this.__context__[this.junctionDAOKey];
      }
    }
  ],

  methods: [
    function find_(x, key) {
      var id = foam.core.FObject.isInstance(key) ? key.id : key;
      var self = this;
      return self.junctionDAO.find_(x, self.junctionKeyFactory(id)).then(function(a) {
        return a && self.delegate.find_(x, id);
      });
    },
    function select_(x, sink, skip, limit, order, predicate) {
      var self = this;

      return self.junctionDAO.
        where(self.EQ(self.sourceProperty, self.sourceKey)).
        select(self.MAP(self.junctionProperty)).then(function(map) {
          return self.delegate.select_(x, sink, skip, limit, order, self.AND(
            predicate || self.TRUE,
            self.IN(self.targetProperty, map.delegate.array)));
        });
    }
  ]
});
