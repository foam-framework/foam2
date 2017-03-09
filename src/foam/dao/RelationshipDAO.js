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
      class: 'Boolean',
      name: 'forward',
      value: true
    },
    {
      name: 'predicate',
      getter: function() {
        return this.relationship.targetQueryFromSource(this.obj, this.forward);
      }
    },
    {
      name: 'delegate',
      factory: function() {
        var key = this.relationship[this.forward ? 'targetDAOKey' : ' sourceDAOKey'];
        var delegate = this.__context__[key];

        foam.assert(delegate, 'Missing relationship DAO:', key);

        return delegate;
      }
    }
  ],

  methods: [
    function put(obj) {
      this.relationship.adaptTarget(this.obj, obj, this.forward);

      return this.SUPER(obj);
    },

    function clone() {
      // Prevent cloneing
      return this;
    }
  ]
});
