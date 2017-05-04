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
  name: 'DAOController',
  properties: [
    {
      name: 'data',
      hidden: true
    },
    {
      name: 'predicate',
      view: { class: 'foam.u2.view.RecipricalSearch' }
    },
    {
      name: 'filteredDAO',
      view: { class: 'foam.u2.view.ScrollTableView' },
      expression: function(data, predicate) {
        return ! data ? foam.dao.NullDAO.create() :
          predicate ? data.where(predicate) :
          data;
      }
    },
    {
      name: 'selection',
      hidden: true
    }
  ],

  actions: [
    {
      name: 'create',
      code: function() { }
    },
    {
      name: 'edit',
      isEnabled: function(selection) { return !! selection; },
      code: function() {
        this.pub('edit', this.selection.id);
      }
    }
  ]
});
