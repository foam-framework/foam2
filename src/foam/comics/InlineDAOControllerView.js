/**
 * @license
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
  name: 'InlineDAOControllerView',
  extends: 'foam.u2.Element',

  imports: [
    'stack'
  ],

  exports: [
    'editRecord'
  ],

  requires: [
    'foam.comics.DAOController'
  ],

  properties: [
    'data',
    {
      name: 'of',
      expression: function(data) {
        return data.of;
      },
    },
    {
      name: 'controller',
      factory: function() {
        var controller = this.DAOController.create();
        this.onDetach(controller.of$.follow(this.of$));
        this.onDetach(controller.data$.follow(this.data$));
        return controller;
      }
    }
  ],

  methods: [
    function editRecord(obj) {
      this.stack.push({
        class: 'foam.comics.DAOUpdateControllerView',
        of: this.of,
        data: obj.clone()
      });
    },
    function initE() {
      this.startContext({ data: this.controller }).
        add(this.DAOController.FILTERED_DAO,
            this.DAOController.CREATE).
        endContext();
    }
  ]
});
