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

  requires: [
    'foam.u2.view.EditColumnsView',
    'foam.u2.md.OverlayDropdown'
  ],

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
      name: 'data',
      postSet: function(_, data) {
        if ( ! this.of && data ) this.of = data.of;
      }
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
      expression: function(columns, of) {
        var of = this.of;
        if ( ! of ) return [];

        return columns.map(function(p) {
          var c = typeof p == 'string' ?
            of.getAxiomByName(p) :
            p ;

           if ( ! c ) {
             console.error('Unknown table column: ', p);
           }

          return c;
        }).filter(function(c) { return c; });
      }
    },
    {
      name: 'columns',
      expression: function(of) {
        var of = this.of;
        if ( ! of ) return [];

        var tableColumns = of.getAxiomByName('tableColumns');

        if ( tableColumns ) return tableColumns.columns;

        return of.getAxiomsByClass(foam.core.Property).
            filter(function(p) { return ! p.hidden; }).
            map(foam.core.Property.NAME.f);
      }
    },
    {
      class: 'Boolean',
      name: 'editColumnsEnabled',
      documentation: 'Set this to true to let the user select columns.',
      value: true // TODO: Return to false after testing
    },
    {
      name: 'columnSelectionE',
      factory: function() {
        var editor = this.EditColumnsView.create({
          properties$: this.columns_$,
          selectedProperties$: this.columns_$
        });

        for (var i = 0; i < this.columns_.length; ++i) {
          console.log(editor.properties[i].name)
        }

        console.log(editor)

        editor.initE();

        console.log('returning from columnSelectionE')
        return this.OverlayDropdown.create().add(editor);
      }
    },
    'selection',
    'hoverSelection'
  ],


  actions: [
    {
      name: 'clearSelection',
      icon: 'https://www.iconfinder.com/data/icons/48x48-free-object-icons/48/Add.png',
      isAvailable: function() { return !!this.hardSelection; },
      code: function() {
        this.hardSelection = null;
      }
    },
    {
      name: 'editColumns',
      icon: 'https://www.iconfinder.com/data/icons/48x48-free-object-icons/48/Add.png',
      isAvailable: function() { return this.editColumnsEnabled; },
      code: function() {
        console.log('should never be shown')
        // this.columnSelectionE.open();
      }
    }
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
        addClass(this.myClass(this.of.id.replace(/\./g,'-'))).
        setNodeName('table').
        start('thead').
          add(this.slot(function(columns_) {
            return this.E('tr').
              forEach(columns_, function(column) {
                this.start('th').
                  addClass(view.myClass('th-' + column.name)).
                  on('click', function(e) { view.sortBy(column); }).
                  call(column.tableHeaderFormatter, [column]).
                  add(' ', this.slot(function(order) {
                    return column === order ? this.Entity.create({ name: '#9651' }) :
                        (view.Desc.isInstance(order) && order.arg1 === column) ? this.Entity.create({ name: '#9661' }) :
                        ''
                  }, view.order$)).
                end();

                if (column == columns_[columns_.length - 1]) {
                  this.start('th').addClass(view.myClass('th-editColumns')).
                on('click', function(e) {
                  console.log('editing columns')
                  
                  view.columnSelectionE.open();

                }).start('img').attr('src','https://cdn4.iconfinder.com/data/icons/48x48-free-object-icons/48/Add.png').end();
                }
              })
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
                        if ( view.editRecord$ ) view.editRecord(obj);
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

                        if (column == columns_[columns_.length - 1]) {
                          this.start('td').
                          call(column.tableCellFormatter, [
                            null, obj, column
                          ]).
                          end();
                        }
                      });
              });
          }));

    }
  ]
});
