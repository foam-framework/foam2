/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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
  package: 'foam.comics',
  name: 'RelationshipDAOController',
  extends: 'foam.comics.DAOController',
  requires: [
    'foam.comics.RelationshipDAOAddController',
    'foam.comics.RelationshipDAOAddControllerView',
  ],
  properties: [
    'relationshipPropertyValue',
    'relationshipPropertyValueSourceId',
  ],
  methods: [
    function init() {
      this.SUPER();
      this.onDetach(
        this.relationshipPropertyValueSourceId$.follow(
          this.relationshipPropertyValue$.dot('sourceId')));
    },
  ],
  actions: [
    {
      name: 'add',
      isEnabled: function(relationshipPropertyValueSourceId) {
        return !!relationshipPropertyValueSourceId;
      },
      code: function() {
        this.stack.push({
          class: 'foam.comics.RelationshipDAOAddControllerView',
          data: this.RelationshipDAOAddController.create({
            data: this.relationshipPropertyValue.targetDAO,
            relationshipDAO: this.relationshipPropertyValue.dao,
          }),
        });
      }
    }
  ],
});
