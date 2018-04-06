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
/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'ManyToManyRelationshipDAO',
  extends: 'foam.dao.ProxyDAO',

  implements: [ { path: 'foam.mlang.Expressions', java: false } ],

  documentation: 'Adapts a DAO based on a *:* Relationship.',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.dao.ManyToManyRelationshipImpl',
      name: 'relationship'
    }
  ],

  methods: [
    {
      name: 'find_',
      code: function find_(x, id) {
        var self = this;
        var junction = this.relationship.createJunction(id)

        return this.relationship.junctionDAO.find(junction.id).then(function(a) {
          return a && self.delegate.find_(x, id);
        });
      }
    },
    {
      name: 'select_',
      code: function select_(x, sink, skip, limit, order, predicate) {
        var self = this;

        return this.relationship.junctionDAO.
          where(self.EQ(this.relationship.sourceProperty, this.relationship.sourceId)).
          select(self.MAP(this.relationship.targetProperty)).then(function(map) {
            return self.delegate.select_(x, sink, skip, limit, order, self.AND(
              predicate || self.TRUE,
              self.IN(self.of.ID, map.delegate.array)));
          });
      },
      javaCode: `foam.mlang.sink.Map junction = (foam.mlang.sink.Map)getRelationship().getJunctionDAO().where(
    foam.mlang.MLang.EQ(getRelationship().getSourceProperty(), getRelationship().getSourceId())).
  select(foam.mlang.MLang.MAP(getRelationship().getTargetProperty(), new foam.dao.ArraySink()));

  return getDelegate().where(foam.mlang.MLang.IN(getPrimaryKey(), ((foam.dao.ArraySink)(junction.getDelegate())).getArray().toArray())).select_(
    x, sink, skip, limit, order, predicate);`,

      swiftCode: function () {
        /* let pred = __context__.create(Eq.self, args: [
          "arg1": relationship?.sourceProperty,
          "arg2": relationship?.sourceId
        ])

        let map = __context__.create(Map.self, args: [
          "arg1": relationship?.targetProperty,
          "delegate": __context__.create(ArraySink.self)
        ])

        let junction: Map = try relationship!.junctionDAO!.`where`(pred).select(map!) as! Map
        return try delegate.`where`(__context__.create(In.self, args: [
          "arg1": primaryKey,
          "arg2": __context__.create(ArrayConstant.self, args: [
            "value": (junction.delegate as? ArraySink)?.array
          ])
        ])).select_(x, sink, skip, limit, order, predicate)  */
      }
    }
  ]
});
