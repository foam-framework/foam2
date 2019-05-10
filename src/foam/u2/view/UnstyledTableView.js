/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'UnstyledTableView',
  extends: 'foam.u2.Element',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.dao.ProxyDAO',
    'foam.u2.md.OverlayDropdown',
    'foam.u2.view.OverlayActionListView',
    'foam.u2.view.EditColumnsView',
    'foam.u2.tag.Image'
  ],

  exports: [
    'columns',
    'selection',
    'hoverSelection'
  ],

  imports: [
    'ctrl',
    'dblclick?',
    'editRecord?',
    'selection? as importSelection'
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
            p;

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
      class: 'FObjectArray',
      of: 'foam.core.Action',
      name: 'contextMenuActions',
      documentation: `
        Each table row has a context menu that contains actions you can perform
        on the object in that row. The actions used to populate that menu come
        from two different sources. The first source is this property. If you
        want a context menu action to do something in the view, then you should
        write the code for that action in the view model and pass it to the
        table view via this property. The second source of actions is from the
        model of the object being shown in the table.
      `
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
      name: 'restingIcon',
      documentation: 'Image for grayed out double arrow when table header is not sorting',
      value: 'images/resting-arrow.svg'
    },
    {
      name: 'ascIcon',
      documentation: 'Image for table header ascending sorting arrow',
      value: 'images/up-arrow.svg'
    },
    {
      name: 'descIcon',
      documentation: 'Image for table header descending sorting arrow',
      value: 'images/down-arrow.svg'
    },
    {
      name: 'selection',
      expression: function(importSelection) { return importSelection || null; },
    },
    'hoverSelection',
    'dropdownOrigin',
    'overlayOrigin',
    {
      type: 'Boolean',
      name: 'showHeader',
      value: true,
      documentation: 'Set to false to not render the header.'
    }
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

    function initE() {
      var view = this;
      var columnSelectionE;

      if ( this.editColumnsEnabled ) {
        columnSelectionE = this.createColumnSelection();
        this.ctrl.add(columnSelectionE);
      }

      this.
        addClass(this.myClass()).
        addClass(this.myClass(this.of.id.replace(/\./g, '-'))).
        setNodeName('table').
        start('thead').
          show(this.showHeader$).
          add(this.slot(function(columns_) {
            return this.E('tr').
              forEach(columns_, function(column) {
                this.start('th').
                  addClass(view.myClass('th-' + column.name)).
                  callIf(column.tableWidth, function() {
                    this.style({ width: column.tableWidth + 'px' });
                  }).
                  on('click', function(e) {
                    view.sortBy(column);
                  }).
                  call(column.tableHeaderFormatter, [column]).
                  callIf(column.label != '', function() {
                    this.start('img').attr('src', this.slot(function(order) {
                      return column === order ? view.ascIcon :
                          (view.Desc.isInstance(order) && order.arg1 === column)
                          ? view.descIcon : view.restingIcon;
                    }, view.order$)).end();
                  }).
                end();
              }).
              call(function() {
                this.start('th').
                  callIf(view.editColumnsEnabled, function() {
                    this.addClass(view.myClass('th-editColumns')).
                    on('click', function(e) {
                      columnSelectionE.open(e.clientX, e.clientY);
                    }).
                    tag(view.Image, { data: '/images/Icon_More_Resting.svg' }).
                    addClass(view.myClass('vertDots')).
                    addClass(view.myClass('noselect'));
                  }).
                  style({ width: '60px' }).
                  tag('div', null, view.dropdownOrigin$).
                end();
              });
          })).
        end().
        add(this.rowsFrom(this.data));
    },
    {
      name: 'rowsFrom',
      code: function(dao) {
        var view = this;
        return this.slot(function(columns_) {
          // Make sure the DAO set here responds to ordering when a user clicks
          // on a table column header to sort by that column.
          if ( this.order ) dao = dao.orderBy(this.order);
          var proxy = view.ProxyDAO.create({ delegate: dao });
          view.sub('propertyChange', 'order', function(_, __, ___, s) {
            proxy.delegate = dao.orderBy(s.get());
          });

          var modelActions = view.of.getAxiomsByClass(foam.core.Action);
          var actions = Array.isArray(view.contextMenuActions)
            ? view.contextMenuActions.concat(modelActions)
            : modelActions;

          return this.
            E('tbody').
            select(proxy, function(obj) {
              return this.E('tr').
                on('mouseover', function() { view.hoverSelection = obj; }).
                callIf(view.dblclick && ! view.disableUserSelection, function() {
                  this.on('dblclick', function() {
                    view.dblclick && view.dblclick(obj);
                  });
                }).
                callIf( ! view.disableUserSelection, function() {
                  this.on('click', function(evt) {
                    // If we're clicking somewhere to close the context menu,
                    // don't do anything.
                    if (
                      evt.target.nodeName === 'DROPDOWN-OVERLAY' ||
                      evt.target.classList.contains(view.myClass('vertDots'))
                    ) return;

                    view.selection = obj;
                    if ( view.importSelection$ ) view.importSelection = obj;
                    if ( view.editRecord$ ) view.editRecord(obj);
                  });
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
                      callIf(column.f, function() {
                        try {
                          var value = column.f(obj);
                          if ( foam.util.isPrimitive(value) ) {
                            this.attr('title', value);
                          }
                        } catch (err) {}
                      }).
                    end();
                }).
                start('td')
                  .attrs({ name:'contextMenuCell' }).
                  addClass(view.myClass('context-menu-cell')).
                  tag(view.OverlayActionListView, {
                    data: actions,
                    obj: obj
                  }).
                end();
            });
        });
      }
    }
  ]
});
