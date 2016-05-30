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
//  extends: 'foam.dao.FilteredDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Adapts a DAO based on a Relationship.',

  properties: [
    {
      name: 'relationship',
      required: true
    },
    {
      name: 'query',
      factory: function() {
        return this.relationship.targetDAOQuery();
      }
    }
  ],

  methods: [
    function put(obj, sink) {
      this.relationship.adaptTarget(obj);

      return this.SUPER(obj, sink);
    }
  ]
});
