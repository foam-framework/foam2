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
  package: 'foam.u2.view',
  name: 'TreeViewRow',
  extends: 'foam.u2.Element',

  requires: [
    'foam.mlang.ExpressionsSingleton'
  ],

  exports: [
    'data'
  ],

  imports: [
    'selection',
    'onObjDrop'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function() {/*
        ^ { white-space: nowrap; margin-left:16px; }
        ^selected { outline: 2px solid #dddd00; }
      */}
    })
  ],

  properties: [
    {
      name: 'data'
    },
    {
      name: 'relationship'
    },
    {
      class: 'Boolean',
      name: 'expanded',
      value: false
    },
    {
      class: 'Function',
      name: 'formatter'
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.
        cssClass(this.myCls()).
        cssClass(this.slot(function(selected, id) {
          if ( selected && foam.util.equals(selected.id, id) ) {
            return this.myCls('selected');
          }
          return '';
        }, this.selection$, this.data$.dot('id'))).
        attrs({ draggable: 'true' }).
        start('span').
          on('click', this.toggleExpanded).
          add(this.expanded$.map(function(v) { return v ? '\u25BD' : '\u25B7'; })).
          entity('nbsp').
        end().
        on('click', this.selected).
        on('dragstart', this.onDragStart).
        on('dragenter', this.onDragOver).
        on('dragover', this.onDragOver).
        on('drop', this.onDrop).
        call(this.formatter).
        add(this.slot(function(e) {
          if ( ! e ) return this.E('div');
          var e2 = this.E('div');
          e2.select(this.data[self.relationship.forwardName], function(obj) {
            return self.cls_.create({
              data: obj,
              formatter: self.formatter,
              relationship: self.relationship
            }, this);
          });
          return e2;
        }, this.expanded$));
    }
  ],

  listeners: [
    function onDragStart(e) {
      e.dataTransfer.setData('application/x-foam-obj-id', this.data.id);
      e.stopPropagation();
    },

    function onDragOver(e) {
      if ( ! e.dataTransfer.types.some(function(m) { return m === 'application/x-foam-obj-id'; }) )
        return;

      var id = e.dataTransfer.getData('application/x-foam-obj-id');

      if ( foam.util.equals(id, this.data.id) )
        return;

      e.preventDefault();
      e.stopPropagation();
    },

    function onDrop(e) {
      if ( ! e.dataTransfer.types.some(function(m) { return m === 'application/x-foam-obj-id'; }) )
        return;

      var id = e.dataTransfer.getData('application/x-foam-obj-id');

      if ( foam.util.equals(id, this.data.id) ) return;

      e.preventDefault();
      e.stopPropagation();

      var self = this;
      var dao  = this.__context__[this.relationship.targetDAOKey];
      dao.find(id).then(function(obj) {
        dao.remove(obj).then(function() {
          self.data[self.relationship.forwardName].put(obj).then(function(obj) {
            self.onObjDrop(obj, id);
          });
        });
      });
    },

    function selected(e) {
      this.selection = this.data;
      e.preventDefault();
      e.stopPropagation();
    },

    function toggleExpanded(e) {
      this.expanded = ! this.expanded;
      e.preventDefault();
      e.stopPropagation();
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.view',
  name: 'TreeView',
  extends: 'foam.u2.Element',

  requires: [
    'foam.mlang.ExpressionsSingleton',
    'foam.u2.view.TreeViewRow'
  ],

  exports: [
    'onObjDrop',
    'selection'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      name: 'relationship'
    },
    {
      name: 'selection'
    },
    {
      class: 'Function',
      name: 'formatter'
    },
    {
      class: 'Boolean',
      name: 'startExpanded',
      value: false
    }
  ],

  methods: [
    function initE() {
      var M = this.ExpressionsSingleton.create();
      var of = foam.lookup(this.relationship.sourceModel);

      var dao = this.data$proxy.where(
        M.NOT(M.HAS(of.getAxiomByName(this.relationship.inverseName))));

      var self = this;
      this.cssClass(this.myCls()).
        select(dao, function(obj) {
          return self.TreeViewRow.create({
            data: obj,
            relationship: self.relationship,
            expanded: self.startExpanded,
            formatter: self.formatter
          }, this);
        });
    },

    function onObjDrop(obj, target) {
      // Template Method
    }
  ]
});
