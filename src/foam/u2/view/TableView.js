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

        ^vertDots {
          font-size: 20px;
          font-weight: bold;
          padding-right: 10px;
        }

        ^noselect {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
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
      class: 'Boolean',
      name: 'refreshDisplay',
      documentation: 'Will be removed when better refresh strategy is found',
      value: true
    },
    {
      name: 'ascIcon',
      documentation: 'HTML entity representing unicode Up-Pointing Triangle',
      factory: function() {
        return this.Entity.create({ name: '#9651' });
      }
    },
    {
      name: 'descIcon',
      documentation: 'HTML entity representing unicode Down-Pointing Triangle',
      factory: function() {
        return this.Entity.create({ name: '#9661' });
      }
    },
    {
      name: 'vertMenuIcon',
      documentation: 'HTML entity representing unicode Vertical Ellipsis',
      factory: function() {
        return this.Entity.create({ name: '#8942' });
      }
    },
    'selection',
    'hoverSelection'
  ],

  methods: [
    function detach() { console.log('table view detaching')},
    function sortBy(column) {
      this.order = this.order === column ?
        this.DESC(column) :
        column;
    },

    function createColumnSelection() {
      console.log('creating selections')
      var editor = this.EditColumnsView.create({
        properties: this.columns_
      });

      editor.properties$.sub(function() {
        console.log('this is focused is a', this.focused, 'statement');
        console.log('selections changed')

        console.log('columns_ before', this.columns_)
        this.columns = editor.properties
                          .filter(function(c) { return c.visible; })
                          .map(function(c) { return c.prop.name; });
        console.log('columns_ after', this.columns_)

      }.bind(this));

      return this.OverlayDropdown.create().add(editor);
    },

    /** Adds offset for edit columns overlay dropdown
     * OverlayDropdown adds element to top right of parent container.
     * We want the table dropdown to appear below the dropdown icon.
     */
    function positionOverlayDropdown(columnSelectionE) {
      // Dynamic position calculation
      var origin = document.getElementsByClassName(this.of.id.replace(/\./g,'-') 
                                                  + '-EditColumnsDropdownOrigin')[0];
      var current = document.getElementsByClassName('foam-u2-md-OverlayDropdown-container')[0].parentElement;
      var boundingBox = origin.getBoundingClientRect();
      var dropdownMenu = current.getBoundingClientRect();

      columnSelectionE.style({ top: boundingBox.top - dropdownMenu.top + 'px'});
    },

    function init() {
      console.log('table view init')
      this.onFocus(function() {console.log('focusing table view')});
    },

    function initE() {
      console.log('***************************** initE');
      var view = this;
      var columnSelectionE;

      if (view.editColumnsEnabled) {
        // There has to be a better way to do this
        this.add(this.slot(function(refresh) {
                        columnSelectionE = view.createColumnSelection();
                        return this.E('div').add(columnSelectionE); }, 
                        view.refreshDisplay$));
      }

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
                    return column === order ? view.ascIcon :
                        (view.Desc.isInstance(order) && order.arg1 === column) ? view.descIcon : ''
                  }, view.order$)).
                end();
              }).
              add(this.slot(function(editColumnsEnabled) { 
                if (editColumnsEnabled) {
                  return this.E('th').
                    addClass(view.myClass('th-editColumns')).
                      on('click', function(e) {
                        e.stopPropagation();
                        view.refreshDisplay = !view.refreshDisplay;
                        columnSelectionE.shown = true;
                        //view.positionOverlayDropdown(columnSelectionE);
                        columnSelectionE.open();
                      }).
                      add(' ', view.vertMenuIcon).
                        addClass(view.myClass('vertDots')).
                        addClass(view.myClass('noselect')).
                        start('div').
                        addClass(view.of.id.replace(/\./g,'-') +
                            '-EditColumnsDropdownOrigin').end();
               }
              }.bind(this), view.editColumnsEnabled$));
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
                      }).
                      add(this.slot(function(editColumnsEnabled) { 
                        if (editColumnsEnabled) return this.E('td'); }, 
                        view.editColumnsEnabled$))
              });
          }));
    }
  ]
});
