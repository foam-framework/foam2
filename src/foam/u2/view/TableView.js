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
  name: 'TableCellPropertyRefinement',

  refines: 'foam.core.Property',

  properties: [
    {
      name: 'tableHeaderFormatter',
      value: function(axiom) {
        this.add(axiom.label);
      }
    },
    {
      name: 'tableCellFormatter',
      value: function(value, obj, axiom) {
        this.add(value);
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Action',

  properties: [
    {
      name: 'tableCellFormatter',
      value: function(_, obj, axiom) {
        this.
          startContext({ data: obj }).
          add(axiom).
          endContext();
      }
    },
    {
      name: 'tableHeaderFormatter',
      value: function(axiom) {
        this.add(axiom.label);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.view',
  name: 'TableView',
  extends: 'foam.u2.Element',

  implements: [ 'foam.mlang.Expressions' ],

  exports: [
    'columns',
    'selection',
    'hoverSelection'
  ],

  imports: [
    'editRecord?',
    'selection? as importSelection'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ th {
          text-align: left;
          white-space: nowrap;
        }

        ^row:hover {
          background: #eee;
        }

        ^selected {
          background: #eee;
          outline: 1px solid #f00;
        }
    */}
    })
  ],

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'orderedDAO',
      expression: function(data, order) {
        return data ? data.orderBy(order) : foam.dao.NullDAO.create();
      }
    },
    {
      name: 'order'
    },
    {
      name: 'columns_',
      expression: function(columns, data, of) {
        var of = this.of || ( data && data.of);
        if ( ! of ) return [];

        return columns.map(function(p) {
          return typeof p == 'string' ?
            of.getAxiomByName(p) :
            p ;
        });
      }
    },
    {
      name: 'columns',
      expression: function(data, of) {
        var of = this.of || ( data && data.of);
        if ( ! of ) return [];

        var tableColumns = of.getAxiomByName('tableColumns');

        if ( tableColumns ) return tableColumns.columns;

        return of.getAxiomsByClass(foam.core.Property).
          filter(function(p) { return ! p.hidden; }).
          map(foam.core.Property.NAME.f);
      }
    },
    'selection',
    'hoverSelection'
  ],

  methods: [
    function sortBy(column) {
      this.order = this.order === column ?
        this.DESC(column) :
        column;
    },

    function initE() {
      var view = this;

      this.
        addClass(this.myClass()).
        setNodeName('table').
        start('thead').
        add(this.slot(function(columns_) {
          return this.E('tr').
            forEach(columns_, function(column) {
              this.
                start('th').
                on('click', function(e) { view.sortBy(column); }).
                call(column.tableHeaderFormatter, [column]).
                add(' ', this.slot(function(order) {
                  return column === order ? this.Entity.create({ name: '#9651' }) :
                      (view.Desc.isInstance(order) && order.arg1 === column) ? this.Entity.create({ name: '#9661' }) :
                      ''
                }, view.order$)).
                end();
            });
        })).
        add(this.slot(function(columns_) {
          return this.
            E('tbody').
            select(this.orderedDAO$proxy, function(obj) {
              return this.
                E('tr').
                start('tr').
                on('mouseover', function() { view.hoverSelection = obj; }).
                on('click', function() {
                  view.selection = obj;
                  if ( view.importSelection$ ) view.importSelection = obj;
                  if ( view.editRecord ) view.editRecord(obj);
                }).
                addClass(this.slot(function(selection) {
                  if ( obj === selection ) return view.myClass('selected');
                  return '';
                }, view.selection$)).
                addClass(view.myClass('row')).
                forEach(columns_, function(column) {
                  this.
                    start('td').
                    call(column.tableCellFormatter, [
                      column.f ? column.f(obj) : null, obj, column
                    ]).
                    end();
                });
            });
        }));
    }
  ]
});
