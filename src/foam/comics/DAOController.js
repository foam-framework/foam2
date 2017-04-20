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
    'foam.u2.stack.Stack',
  ],

  imports: [
    'stack? as importedStack'
  ],

  exports: [
    'stack',
  ],

  properties: [
    {
      name: 'stack',
      /*
      expression: function(importedStack) {
        return importedStack || this.Stack.create();
      },
      */
      factory: function() {
        return this.importedStack || this.Stack.create();
      },
    },
    {
      name: 'data',
      hidden: true,
      factory: function() {
        return this.__context__[foam.String.daoize(this.of.name)];
      }
    },
    {
      name: 'predicate',
      view: function(args, X) {
        return {
          class: 'foam.u2.view.RecipricalSearch',
          of: X.data.of
        };
      }
    },
    {
      name: 'filteredDAO',
      view: 'foam.u2.view.ScrollTableView',
      expression: function(data, predicate) {
        return predicate ? data.where(predicate) : data;
      }
    },
    {
      class: 'Class',
      name: 'of',
      hidden: true
    }
  ],

  actions: [
    {
      name: 'create',
      code: function() {
        this.stack.push({
          class: 'foam.comics.DAOCreateControllerView',
          of: this.of,
          data: this.data
        });
      }
    }
  ]
});
