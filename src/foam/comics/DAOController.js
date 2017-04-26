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

  requires: [
    'foam.comics.DAOCreateController',
    'foam.comics.DAOUpdateController',
  ],

  imports: [
    'stack'
  ],

  properties: [
    {
      name: 'data',
      hidden: true,
      required: true
    },
    {
      name: 'predicate',
      view: function(args, X) {
        return {
          class: 'foam.u2.view.RecipricalSearch',
          of$: X.data$.dot('data').dot('of')
        };
      }
    },
    {
      name: 'filteredDAO',
      view: 'foam.u2.view.ScrollTableView',
      expression: function(data, predicate) {
        return ! data ? foam.dao.NullDAO.create() :
          predicate ? data.where(predicate) :
          data;
      }
    }
  ],

  methods: [
    function edit(obj) {
      this.stack.push({
        class: 'foam.comics.DAOUpdateControllerView',
        data: this.DAOUpdateController.create({
          data: obj.id,
          dao: this.data,
        }),
      });
    },
  ],

  actions: [
    {
      name: 'create',
      code: function() {
        this.stack.push({
          class: 'foam.comics.DAOCreateControllerView',
          data: this.DAOCreateController.create({
            dao: this.data,
          }),
        });
      }
    }
  ]
});
