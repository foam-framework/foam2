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
    //'query',
    'selection',
    'startExpanded'
  ],

  css: `
    ^ {
      white-space: nowrap;
      margin: 6px 20px;
      inset: none;
      cursor: pointer;
      margin-right: 0;
    }

    ^:hover > ^heading {
      xxxborder-radius: 2px;
      background-color: #e7eaec;
      color: #406dea;
    }

    ^label {
      min-width: 120px;
      padding: 4px;
      font-weight: 500;
      display: inline-block;
      width: 250px;
      color: /*%BLACK%*/ #1e1f21;
    }

    ^heading {
      border-left: 4px solid rgba(0,0,0,0);
    }

    ^selected > ^label {
      xxxborder-radius: 2px;
      xxxbackground-color: rgba(0, 48, 249, 0.1);
      xxxcolor: #0098db;
    }

    ^selected > ^heading {
      xxxborder-radius: 2px;
      background-color: #e5f1fc !important;
      color: #406dea;
      border-left: 4px solid /*%PRIMARY3%*/ #406dea;
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
      documentation: 'Enable to allow drag&drop editing.'
    },
    {
      class: 'Boolean',
      name: 'hasChildren'
    },
    {
      class: 'Boolean',
      name: 'doesThisIncludeSearch',
      value: false
    },
    // {
    //   class: 'Boolean',
    //   name: 'showThisRootOnSearch',
    //   value: false
    // },
    'query',
    'showThisRootOnSearch',
    'subMenus',
    'showRootOnSearch',
    'searchStringValue'
  ],

  methods: [
    function initE() {
      var self = this;

      self.subMenus = [];
      //self.searchStringValue = self.query.get();
      //self.doesThisIncludeSearch = self.query.get() ? self.data.label.includes(self.query.get()) : true;
      if(self.showRootOnSearch)
        self.showRootOnSearch.set(self.showRootOnSearch.get() || self.doesThisIncludeSearch);

      this.query.sub(function() {
        self.searchStringValue = self.query.get();
      });

      this.data[self.relationship.forwardName].select().then(function(val){
        if(val.array.length > 0)
          self.hasChildren = true;
        else
          self.hasChildren = false;
        self.subMenus = val.array;
      });

      this.
        addClass(this.myClass()).
        show(this.slot(function(hasChildren, showThisRootOnSearch, searchStringValue) {
          // if(self.data.label == 'Ablii')
          //   console.log();
          
          // if(self.data.parent == 'sme')
          //   console.log();
            
          self.doesThisIncludeSearch = self.query.get() ? self.data.label.includes(self.query.get()) : true;
          var shouldThisBeShown = self.query.get() ? (self.doesThisIncludeSearch && !hasChildren) || (hasChildren && showThisRootOnSearch) : true;//( self.data.label.includes(self.query) || self.hasChildren )

          if(self.query.get() && shouldThisBeShown)
            self.expanded = true;

          if(self.showRootOnSearch && self.query.get())
            self.showRootOnSearch.set(self.showRootOnSearch.get() || shouldThisBeShown);
          return shouldThisBeShown;
        })).
        addClass(this.slot(function(selected, id) {
          if ( selected && foam.util.equals(selected.id, id) ) {
            return this.myClass('selected');
          }
          return '';
        }, this.selection$, this.data$.dot('id'))).
        on('click', this.toggleExpanded).
//        on('click', this.selected).
        on('dblclick', function() { self.dblclick && self.dblclick(self.data); }).
        callIf(this.draggable, function() {
          this.
          attrs({ draggable: 'true' }).
          on('dragstart', this.onDragStart).
          on('dragenter', this.onDragOver).
          on('dragover',  this.onDragOver).
          on('drop',      this.onDrop);
        }).
        start().
          addClass(self.myClass('heading')).
          start('span').
            addClass(self.myClass('label')).
            call(this.formatter, [self.data]).
          end().
          start('span').
            show(this.hasChildren$).
            style({
              'margin-right': '5px',
              'vertical-align': 'middle',
              'font-weight': 'bold',
              'display': 'inline-block',
              'visibility': 'visible',
              'font-size': '16px',
              'transform': this.expanded$.map(function(c) { return c ? 'rotate(180deg)' : 'rotate(90deg)'; })
            }).
            on('click', this.toggleExpanded).
            add('\u2303').
            entity('nbsp').
          end().
        end().
        start().
          show(this.expanded$).
          add(this.slot(function(subMenus) {
            return this.E().forEach(subMenus/*.dao*/, function(obj) {
              this.add(self.cls_.create({
                data: obj,
                formatter: self.formatter,
                relationship: self.relationship,
                expanded: self.startExpanded,
                showRootOnSearch: self.showThisRootOnSearch$,
                query: self.query
              }, self));
            });
          })).
        end();
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
    //'query',
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
    },
    'query',
    'updatedQuery',
    'showRootsOnSearch'
  ],

  methods: [
    function initE() {
      this.startExpanded = this.startExpanded;
      this.updatedQuery = foam.core.SimpleSlot.create();

      var M   = this.ExpressionsSingleton.create();
      var of  = this.__context__.lookup(this.relationship.sourceModel);

      var dao = this.data$proxy.where(
        M.NOT(M.HAS(of.getAxiomByName(this.relationship.inverseName))));

      var self = this;
      var isFirstSet = false;

      var treeViewRows = [];

      //updates children roots
      this.query.sub(function() {
        this.showRootOnSearch = false;
        treeViewRows.forEach((i) => i.showThisRootOnSearch = false);
        self.updatedQuery.set(self.query.get());
      });

      this.addClass(this.myClass()).
        select(dao, function(obj) {
          if ( ! isFirstSet && ! self.selection ) {
            self.selection = obj;
            isFirstSet = true;
          }
           var item = self.TreeViewRow.create({
            data: obj,
            relationship: self.relationship,
            expanded: self.startExpanded,
            formatter: self.formatter,
            query: this.updatedQuery,
           // showThisRootOnSearch: this.showRootsOnSearch
          }, this);
          treeViewRows.push(item);
          return item;
        });
    },

    function onObjDrop(obj, target) {
      // Template Method
    }
  ]
});
