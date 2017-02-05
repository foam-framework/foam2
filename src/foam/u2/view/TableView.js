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
  package: 'foam.u2',
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

  exports: [
    'columns',
    'selection',
    'hoverSelection'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ th { white-space: nowrap; }

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
      name: 'columns_',
      expression: function(columns, of) {
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
      expression: function(of) {
        if ( ! of ) return [];

        var tableColumns = this.of.getAxiomByName('tableColumns');

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
    function initE() {
      var view = this;

      this.
        setNodeName('table').
        start('thead').
        add(this.slot(function(columns_) {
          return this.E('tr').
            forEach(columns_, function(column) {
              this.
                start('th').
                call(column.tableHeaderFormatter, [column]).
                end();
            });
        })).
        add(this.slot(function(columns_) {
          return this.
            E('tbody').
            select(this.data$proxy, function(obj) {
              return this.
                E('tr').
                start('tr').
                on('mouseover', function() { view.hoverSelection = obj; }).
                on('click', function() { view.selection = obj; }).
                cssClass(this.slot(function(selection) {
                  if ( obj === selection ) return view.myCls('selected');
                  return '';
                }, view.selection$)).
                cssClass(view.myCls('row')).
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
