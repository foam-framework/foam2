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
  name: 'JoinedSink',
  extends: 'foam.dao.ProxySink',

  methods: [
    {
      name: 'put',
      code: function put(obj, fc) {
        return this.dao.find(this.property.f(obj)).then(function() {
          debugger
        });
      }
    },
    {
      name: 'remove',
      code: function remove(obj, fc) {
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'ManyToManyRelationshipDAO',
  extends: 'foam.dao.RelationshipDAO',

  implements: [ 'foam.mlang.Expressions' ],

  documentation: 'Adapts a DAO based on a *:* Relationship.',

  properties: [
    'junctionProperty',
    'joinDAOKey',
    'targetProperty'
  ],

  methods: [/*
    function put(obj, sink) {
      return this.SUPER(this.relationship.adaptTarget(this.obj, obj), sink);
      }*/
    function select(sink, skip, limit, order, predicate) {
      var self    = this;
      var joinDAO = this.__context__[this.joinDAOKey];

      return new Promise(function(resolve, reject) {
        self.SUPER(self.MAP(self.junctionProperty)).then(function(array) {
          resolve(joinDAO.select(sink));
        });
      });
      /*
      var joinSink = this.JoinedSink.create({dao: , property: this.property});

      if ( predicate ) {
        joinSink = this.PredicatedSink.create({predicate: predicate, delgate: joinSink});
      }

      this.delegate.select(joinSink, skip, limit, order, this.predicate)
*/
    }
  ]
});
