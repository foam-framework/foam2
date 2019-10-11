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
    'dblclick?',
    'onObjDrop',
    'selection',
    'startExpanded'
  ],

  css: `
    ^ {
      white-space: nowrap;
      margin: 6px 20px;
      inset: none;
      cursor: pointer;
    }

    ^label:hover {
      border-radius: 2px;
      background-color: rgba(0, 48, 249, 0.1);
      color: #0098db;
    }

    ^label {
      min-width: 120px;
      padding: 4px;
      font-weight: 500;
      color: /*%BLACK%*/ #1e1f21;
    }

    ^selected > ^label {
      border-radius: 2px;
      background-color: rgba(0, 48, 249, 0.1);
      color: #0098db;
    }

    ^expanded {
      transform: rotate(180deg);
    }
  `,

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
    },
    {
      class: 'Boolean',
      name: 'draggable',
      documentation: 'Enable to allow drag&drop editing.',
      value: true
    },
    {
      class: 'Boolean',
      name: 'hasChildren'
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.
        addClass(this.myClass()).
        addClass(this.slot(function(selected, id) {
          if ( selected && foam.util.equals(selected.id, id) ) {
            return this.myClass('selected');
          }
          return '';
        }, this.selection$, this.data$.dot('id'))).
        start('span').
          style({
            visibility: this.hasChildren$.map(function(c) { return c ? 'visible' : 'hidden'; }),
            'margin-right': '5px',
            'vertical-align': 'middle',
            'font-weight': 'bold',
            'display': 'inline-block',
            'visibility': 'visible',
            'font-size': '16px',
            'transform': this.expanded$.map(function(c) { return c ? 'rotate(180deg)' : 'rotate(90deg)' })
          }).
          on('click', this.toggleExpanded).
          add('\u2303').
          entity('nbsp').
        end().
        on('click', this.selected).
        on('dblclick', function() { self.dblclick && self.dblclick(self.data); }).
        callIf(this.draggable, function() {
          this.
          attrs({ draggable: 'true' }).
          on('dragstart', this.onDragStart).
          on('dragenter', this.onDragOver).
          on('dragover',  this.onDragOver).
          on('drop',      this.onDrop);
        }).
        start('span').addClass(self.myClass('label')).call(this.formatter, [self.data]).end().
        add(this.slot(function(e) {
          var e2 = this.E('div');
          if ( ! e ) return e2;
          e2.select(this.data[self.relationship.forwardName]/*.dao*/, function(obj) {
            self.hasChildren = true;
            return self.cls_.create({
              data: obj,
              formatter: self.formatter,
              relationship: self.relationship,
              expanded: self.startExpanded
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
        if ( ! obj ) return null;

        // TODO: We shouldn't have to remove then put,
        // We currently have to because the FLOW editor is not updating properly
        // on a put event for an object that it already has.
        dao.remove(obj).then(function() {
          self.data[self.relationship.forwardName].dao.put(obj).then(function(obj) {
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
      this.selection = this.data;
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
    'selection',
    'startExpanded'
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
      var M   = this.ExpressionsSingleton.create();
      var of  = this.__context__.lookup(this.relationship.sourceModel);
      var dao = this.data$proxy.where(
        M.NOT(M.HAS(of.getAxiomByName(this.relationship.inverseName))));

      var self = this;
      var isFirstSet = false;
      this.addClass(this.myClass()).
        select(dao, function(obj) {
          if ( ! isFirstSet && ! self.selection ) {
            self.selection = obj;
            isFirstSet = true;
          }
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
