/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
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
      class: 'foam.u2.view.TableCellFormatter',
      name: 'tableCellFormatter',
      adapt: function(o, f, prop) {
        if ( foam.Function.isInstance(f) ) {
          return foam.u2.view.FnFormatter.create({
            f: f
          });
        }
        return foam.core.FObjectProperty.ADAPT.value.call(this, o, f, prop);
      },
      factory: function() {
        return foam.u2.view.FnFormatter.create({
          class: 'foam.u2.view.FnFormatter',
          f: function(value, obj, axiom) {
            this.add(value);
          }
        })
      }
    },
    {
      class: 'Int',
      name: 'tableWidth'
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Action',

  properties: [
    {
      class: 'foam.u2.view.TableCellFormatter',
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
  refines: 'foam.core.Enum',

  properties: [
    {
      class: 'foam.u2.view.TableCellFormatter',
      name: 'tableCellFormatter',
      value: function(value) {
        this.add(value.label)
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.FObjectProperty',

  properties: [ [ 'tableCellFormatter', null ] ]
});


foam.CLASS({
  refines: 'foam.core.Currency',

  properties: [
    {
      class: 'foam.u2.view.TableCellFormatter',
      name: 'tableCellFormatter',
      value: function(value) {
        this.start()
          .style({'text-align': 'left', 'padding-right': '20px'})
          .add('$' + (value/100).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'))
        .end();
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Date',

  properties: [
    {
      class: 'foam.u2.view.TableCellFormatter',
      name: 'tableCellFormatter',
      value: function(date) {
        if ( date ) this.add(date.toLocaleDateString());
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.DateTime',

  properties: [
    {
      class: 'foam.u2.view.TableCellFormatter',
      name: 'tableCellFormatter',
      value: function(date) {
        if ( date ) this.add(date.toLocaleString());
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
    'dblclick?',
    'editRecord?',
    'selection? as importSelection'
  ],

  css: `
    ^ {
      border-spacing: 14px 8px;
    }

    ^ th {
      text-align: left;
      white-space: nowrap;
    }

    ^row:hover {
      background: #eee;
      cursor: pointer;
    }

    ^selected {
      background: #eee;
    }

    ^vertDots {
      font-size: 20px;
      font-weight: bold;
      padding-right: 12px;
    }

    ^noselect {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
  `,

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
            filter(function(p) { return p.tableCellFormatter && ! p.hidden; }).
            map(foam.core.Property.NAME.f);
      }
    },
    {
      class: 'Boolean',
      name: 'editColumnsEnabled',
      value: true,
      documentation: 'Set this to true to let the user select columns.'
    },
    {
      class: 'Boolean',
      name: 'disableUserSelection',
      value: false,
      documentation: 'Ignores selection by user.'
    },
    {
      name: 'ascIcon',
      documentation: 'HTML entity representing unicode Up-Pointing Triangle',
      factory: function() {
        return this.Entity.create({ name: '#9650' });
      }
    },
    {
      name: 'descIcon',
      documentation: 'HTML entity representing unicode Down-Pointing Triangle',
      factory: function() {
        return this.Entity.create({ name: '#9660' });
      }
    },
    {
      name: 'vertMenuIcon',
      documentation: 'HTML entity representing unicode Vertical Ellipsis',
      factory: function() {
        return this.Entity.create({ name: '#8942' });
      }
    },
    {
      name: 'selection',
      expression: function(importSelection) { return importSelection || null; },
    },
    'hoverSelection',
    'dropdownOrigin',
    'overlayOrigin'
  ],

  methods: [
    function sortBy(column) {
      this.order = this.order === column ?
        this.DESC(column) :
        column;
    },

    function createColumnSelection() {
      var editor = this.EditColumnsView.create({
        columns: this.columns,
        columns_$: this.columns_$,
        table: this.of
      });

      return this.OverlayDropdown.create().add(editor);
    },

    /** Adds offset for edit columns overlay dropdown
     * OverlayDropdown adds element to top right of parent container.
     * We want the table dropdown to appear below the dropdown icon.
     */
    function positionOverlayDropdown(columnSelectionE) {
      // Dynamic position calculation
      var origin  = this.dropdownOrigin.el();
      var current = this.overlayOrigin.el();

      var boundingBox = origin.getBoundingClientRect();
      var dropdownMenu = current.getBoundingClientRect();

      columnSelectionE.style({ top: boundingBox.top - dropdownMenu.top + 'px'});
    },

    function initE() {
      var view = this;
      var columnSelectionE;

      if ( view.editColumnsEnabled ) {
        columnSelectionE = view.createColumnSelection();
        this.start('div', null, this.overlayOrigin$).add(columnSelectionE).end();
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
                  callIf(column.tableWidth, function() {
                    this.style({width: column.tableWidth});
                  }).
                  on('click', function(e) { view.sortBy(column); }).
                  call(column.tableHeaderFormatter, [column]).
                  add(' ', this.slot(function(order) {
                    return column === order ? view.ascIcon :
                        (view.Desc.isInstance(order) && order.arg1 === column) ? view.descIcon : ''
                  }, view.order$)).
                end();
              }).
              call(function() {
                if ( view.editColumnsEnabled ) {
                  this.start('th').
                    addClass(view.myClass('th-editColumns')).
                    on('click', function(e) {
                      view.positionOverlayDropdown(columnSelectionE);
                      columnSelectionE.open();
                    }).
                    add(' ', view.vertMenuIcon).
                    addClass(view.myClass('vertDots')).
                    addClass(view.myClass('noselect')).
                    tag('div', null, view.dropdownOrigin$)
                  .end();
                }
              })
          })).
          add(this.slot(function(columns_) {
            return this.
              E('tbody').
              select(this.orderedDAO$proxy, function(obj) {
                return this.E('tr').
                  on('mouseover', function() { view.hoverSelection = obj; }).
                  callIf(view.dblclick && ! view.disableUserSelection, function() {
                    this.on('dblclick', function() {
                      view.dblclick && view.dblclick(obj);
                    });
                  }).
                  callIf( ! view.disableUserSelection, function() {
                    this.on('click', function() {
                      view.selection = obj;
                      if ( view.importSelection$ ) view.importSelection = obj;
                      if ( view.editRecord$ ) view.editRecord(obj);
                    })
                  }).
                  addClass(view.slot(function(selection) {
                    return selection && foam.util.equals(obj.id, selection.id) ?
                        view.myClass('selected') : '';
                  })).
                  addClass(view.myClass('row')).
                  forEach(columns_, function(column) {
                    this.
                      start('td').
                        callOn(column.tableCellFormatter, 'format', [
                          column.f ? column.f(obj) : null, obj, column
                        ]).
                      end();
                  }).
                  call(function() {
                    if ( view.editColumnsEnabled ) return this.tag('td');
                  })
              });
          }));
    }
  ]
});
