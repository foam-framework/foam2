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
  name: 'DAOUpdateControllerView',
  extends: 'foam.u2.View',
  requires: [
    'foam.comics.DAOUpdateController'
  ],

  imports: [
    'stack',
    'dao'
  ],

  exports: [
    'data'
  ],

  properties: [
    {
      name: 'key'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.DAOUpdateController',
      name: 'data',
      listeners: [
        {
          topic: ['finished'],
          listener: 'onFinished'
        }
      ],
      factory: function() {
        return this.DAOUpdateController.create({
          data: this.key,
          dao: this.dao
        });
      }
    }
  ],

  methods: [
    function initE() {
      this.
        add(this.DAOUpdateController.OBJ,
            this.DAOUpdateController.SAVE,
            this.DAOUpdateController.DELETE);
    }
  ],

  listeners: [
    function onFinished() {
      this.stack.back();
    }
  ]
});
