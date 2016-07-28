/*
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
  package: 'foam.dao',
  name: 'RelationshipDAO',
  extends: 'foam.dao.FilteredDAO',

  documentation: 'Adapts a DAO based on a Relationship.',

  properties: [
    {
      name: 'obj'
    },
    {
      name: 'relationship',
      required: true
    },
    {
      name: 'query',
      factory: function() {
        return this.relationship.targetDAOQuery();
      }
    },
    {
      name: 'predicate',
      getter: function() {
        return this.relationship.targetQueryFromSource(this.obj);
      }
    },
    {
      name: 'delegate',
      factory: function() {
        return this.__context__[this.relationship.targetModel + 'DAO'];
      }
    }
  ],

  methods: [
    function put(obj, sink) {
      this.relationship.adaptTarget(this.obj, obj);

      return this.SUPER(obj, sink);
    }
  ]
});
