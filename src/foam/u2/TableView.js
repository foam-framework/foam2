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

/** Use foam.u2.view.TableView instead. **/

foam.CLASS({
  package: 'foam.u2',
  name: 'TableCellPropertyRefinement',
  refines: 'foam.core.Property',

  properties: [
    {
      name: 'columnLabel',
      factory: function() {
        return this.label;
      }
    },
    {
      name: 'tableCellView',
      value: function(obj) {
        return obj[this.name];
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'TableCellActionRefinement',
  refines: 'foam.core.Action',

  properties: [
    {
      class: 'String',
      name: 'columnLabel'
    },
    {
      name: 'tableCellView',
      value: function(obj, e) {
        //       return foam.u2.ActionView.create({action: this, data: obj});

        return this.toE(null, e.__subContext__.createSubContext({data: obj}));
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'TableBody',
  extends: 'foam.u2.Element',

  requires: [
    // TODO(braden): This should implement Expressions instead.
    'foam.mlang.predicate.And',
    'foam.mlang.predicate.Eq',
    'foam.mlang.predicate.Not',
    'foam.mlang.predicate.Or',
    'foam.u2.CheckBox',
    'foam.u2.TableCellRefinement'
  ],

  imports: [
    'selectionQuery', // Optional. Installed by the TableSelection decorator.
    'tableView'
  ],

  properties: [
    [ 'nodeName', 'tbody' ],
    [ 'columns_' ],
    'selectionFeedback_',
    {
      name: 'rows_',
      factory: function() { return {}; }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.on('click', function(event) {
        var obj = self.eToObj(event);
        if ( obj ) self.tableView.selection = obj;
      }).
      on('dblclick', function(event) {
        var obj = self.eToObj(event);
        if ( obj ) 1;
      });
    },

    function eToObj(event) {
      /** Find the object associated with a DOM element. **/
      var me = this.el();
      var e = event.target;
      while ( e.nodeName !== 'TR' && e !== me )
        e = e.parentNode;

      // If we managed to click between rows, do nothing.
      if ( e === me ) return;

      // Otherwise, we found the tr.
      return this.rows_[e.id];
    },

    function addObj(obj) {
      var e = this.start('tr')
          .enableClass(this.tableView.myClass('selected'),
              this.tableView.selection$.map(function(sel) {
                return sel === obj;
              }));

      if ( this.selectionQuery$ ) {
        var cb;
        e.start('td')
            .start(this.CheckBox).call(function() { cb = this; }).end()
        .end();

        this.selectionQuery$.sub(foam.Function.bind(this.selectionUpdate, this,
            cb, obj));
        this.selectionUpdate(cb, obj);
        cb.data$.sub(foam.Function.bind(this.selectionClick, this, obj));
      }

      for ( var j = 0 ; j < this.columns_.length ; j++ ) {
        var prop = this.columns_[j];
        e = e.start('td').add(prop.tableCellView(obj, e)).end();
      }
      e.end();
      this.rows_[e.id] = obj;
    }
  ],

  listeners: [
    {
      name: 'selectionUpdate',
      code: function(checkbox, obj) {
        var selected = this.selectionQuery.f(obj);
        if ( selected !== checkbox.data ) {
          // Need to prevent feedback between these two listeners.
          this.selectionFeedback_ = true;
          checkbox.data = selected;
          this.selectionFeedback_ = false;
        }
      }
    },
    {
      name: 'selectionClick',
      code: function(obj, _, __, ___, slot) {
        if ( this.selectionFeedback_ ) return;

        var q = this.Eq.create({ arg1: obj.ID, arg2: obj.id });
        if ( slot.get() ) {
          this.selectionQuery = this.Or.create({
            args: [ q, this.selectionQuery ]
          }).partialEval();
        } else {
          this.selectionQuery = this.And.create({
            args: [ this.Not.create({ arg1: q }), this.selectionQuery ]
          }).partialEval();
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'TableBodySink',
  extends: 'foam.dao.AbstractSink',

  requires: [
    'foam.u2.TableBody'
  ],

  properties: [
    'columns_',
    {
      name: 'body',
      factory: function() { return this.TableBody.create({ columns_: this.columns_ }); }
    }
  ],
  methods: [
    function put(obj) {
      this.body.addObj(obj);
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'TableHeader',
  extends: 'foam.u2.Element',

  requires: [
    'foam.mlang.order.Desc',
    'foam.u2.Entity'
  ],

  imports: [
    'selectionQuery', // Optional. Exported by TableSelection.
    'tableView'
  ],

  properties: [
    {
      name: 'columns_',
      required: true
    },
    'sortOrder'
  ],

  methods: [
    function initE() {
      var self = this;
      this.nodeName = 'thead';

      var e = this.start('tr');
      if ( this.selectionQuery$ ) {
        e.tag('td');
      }

      for ( var i = 0 ; i < this.columns_.length ; i++ ) {
        var sorting$ = this.sortOrder$.map(function(prop, order) {
          if ( ! order ) return '';
          var desc = this.Desc.isInstance(order);
          var baseOrder = desc ? order.arg1 : order;
          return prop.name === baseOrder.name ?
              this.Entity.create({ name: desc ? 'darr' : 'uarr' }) : '';
        }.bind(this, this.columns_[i]));

        e.start('td')
            .enableClass(this.myClass('sorting'), sorting$)
            .start('span')
                .addClass(this.myClass('sort-direction'))
                .add(sorting$)
            .end()
            .add(this.columns_[i].columnLabel)
            .on('click', this.tableView.sortBy.bind(this.tableView, this.columns_[i]))
            .end();
      }
      e.end();
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'TableView',
  extends: 'foam.u2.Element',

  requires: [
    'foam.mlang.order.Desc',
    'foam.u2.TableBodySink',
    'foam.u2.TableHeader'
  ],

  exports: [
    'as tableView'
  ],

  css: `
    ^sorting {
      font-weight: bold;
    }

    ^sort-direction {
      display: none;
      margin-right: 8px;
    }
    ^sorting ^sort-direction {
      display: initial;
    }
  `,

  properties: [
    {
      class: 'Class',
      name: 'of',
      factory: function() { return this.data.of; }
    },
    [ 'nodeName', 'table' ],
    {
      name: 'columns_',
      expression: function(columns, of) {
        var cls = this.of;
        return columns.map(function(p) {
          // Lookup String values as Axiom names, otherwise,
          // treat the object as the column object itself.
          return typeof p === 'string' ?
              cls.getAxiomByName(p) :
              p ;
        });
      }
    },
    {
      // TODO: remove when all code ported
      name: 'properties',
      setter: function(_, ps) {
        console.warn("Deprecated use of TableView.properties. Use 'columns' instead.");
        this.columns = ps;
      }
    },
    {
      name: 'columns',
      expression: function(of) {
        if ( ! this.of ) return [];

        var tableColumns = this.of.getAxiomByName('tableColumns');

        if ( tableColumns ) return tableColumns.columns;

        return this.of.getAxiomsByClass(foam.core.Property)
            .filter(function(p) { return ! p.hidden; })
            .map(foam.core.Property.NAME.f);
      }
    },
    {
      name: 'config'
      // Map of property-name: {map of property overrides} for configuring properties
      // values include 'label', 'units', and 'view'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      name: 'header',
      expression: function(columns_) {
        return this.TableHeader.create({
          columns_: columns_,
          sortOrder$: this.sortOrder$
        });
      }
    },
    {
      name: 'body',
      factory: function() { return this.E('tbody'); }
    },
    {
      name: 'sortOrder'
    },
    {
      name: 'selection'
    }
  ],

  methods: [
    function init() {
      this.SUPER();

      console.log('Deprecated use of foam.u2.TableView. Use foam.u2.view.TableView instead.');
    },

    function initE() {
      // Configure columns if 'config' set.
      if ( this.config ) {
        for ( var i = 0 ; i < this.columns_.length ; i++ ) {
          var col = this.columns_[i];
          var cfg = this.config[col.name];

          if ( cfg ) this.columns_[i] = col.clone().copyFrom(cfg);
        }
      }

      this.onDAOUpdate();
      this.data$proxy.sub('on', this.onDAOUpdate);

      return this.
          addClass(this.myClass()).
          add(this.header$, this.body$);
    },

    function sortBy(prop) {
      // Two cases: same as the current prop, or different.
      var sortName = this.sortOrder ?
          (this.Desc.isInstance(this.sortOrder) ? this.sortOrder.arg1.name :
              this.sortOrder.name) :
          '';
      if ( sortName === prop.name ) {
        // Invert the previous order.
        this.sortOrder = this.Desc.isInstance(this.sortOrder) ?
            prop : this.Desc.create({ arg1: prop });
      } else {
        // Set it to the new column.
        this.sortOrder = prop;
      }
      this.onDAOUpdate();
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        var dao = this.data;
        if ( this.sortOrder ) dao = dao.orderBy(this.sortOrder);
        dao.select(this.TableBodySink.create({
          columns_: this.columns_
        })).then(function(a) {
          this.body = a.body;
        }.bind(this));
      }
    }
  ]
});
