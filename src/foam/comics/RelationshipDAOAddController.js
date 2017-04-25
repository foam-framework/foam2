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
  name: 'RelationshipDAOAddController',
  extends: 'foam.comics.DAOController',
  properties: [
    {
      name: 'relationshipDAO',
    },
    {
      name: 'data',
    },
    {
      name: 'selection',
    },
  ],
  actions: [
    {
      name: 'add',
      isEnabled: function(selection) { return !!selection },
      code: function() {
        var self = this;
        this.relationshipDAO.put(this.selection.clone()).then(function() {
          self.stack.back();
        });
      }
    },
  ],
});
