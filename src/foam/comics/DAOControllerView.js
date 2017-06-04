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
  name: 'DAOControllerView',
  extends: 'foam.u2.View',

  requires: [
    'foam.comics.DAOController'
  ],

  imports: [
    'stack',
    'summaryView',
    'data? as importedData'
  ],

  exports: [
    'data.selection as selection',
    'data.data as dao'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.comics.DAOController',
      name: 'data',
      expression: function(importedData) { return importedData; },
    },
    {
      name: 'cls',
      expression: function(data) { return data.cls_; }
    }
  ],

  reactions: [
    [ 'data', 'action.create', 'onCreate' ],
    [ 'data', 'edit', 'onEdit' ],
    [ 'data', 'action.findRelatedObject', 'onFindRelated' ],
    [ 'data', 'finished', 'onFinished']
  ],

  methods: [
    function initE() {
      this.
        start('table').
          start('tr').
            start('td').style({ display: 'block' }).add(this.cls.PREDICATE).end().
            start('td').style({ 'vertical-align': 'top', 'width': '100%' }).
                tag(this.summaryView, {data$: this.data.filteredDAO$}).
            end().
          end().
          start('tr').
            style({background: 'rgba(0,0,0,0)'}).
            show(this.mode$.map(function(m) { return m == foam.u2.DisplayMode.RW; })).
            tag('td').
            start('td').style({'padding-left':'26px'}).add(this.cls.getAxiomsByClass(foam.core.Action)).end().
          end().
        end();
    }
  ],

  listeners: [
    function onCreate() {
      this.stack.push({
        class: 'foam.comics.DAOCreateControllerView'
      }, this);
    },

    function onEdit(s, edit, id) {
      this.stack.push({
        class: 'foam.comics.DAOUpdateControllerView',
        key: id
      }, this);
    },

    function onFindRelated() {
      var data = this.DAOController.create({
        data: this.data.relationship.targetDAO,
        isSelecting: true,
        relationship: this.data.relationship
      });

      this.stack.push({
        class: 'foam.comics.DAOControllerView',
        data: data
      }, this);
    },

    function onFinished() {
      this.stack.back();
    }
  ],
});
