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
    'foam.core.SimpleSlot',
    'foam.dao.ProxyDAO',
    'foam.u2.md.CheckBox',
    'foam.u2.md.OverlayDropdown',
    'foam.u2.view.OverlayActionListView',
    'foam.u2.view.EditColumnsView',
    'foam.u2.view.ColumnConfig',
    'foam.u2.view.ColumnVisibility',
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
    'filteredTableColumns?',
    'selection? as importSelection',
    'stack?'
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
      expression: function(columns, of, allColumns, editColumnsEnabled) {
        if ( ! of ) return [];
        columns = columns.map(c => foam.String.isInstance(c) ? this.of.getAxiomByName(c) : c);
        if ( ! editColumnsEnabled ) return columns;

        // Reorder allColumns to respect the order of columns first followed by
        // the order of allColumns.
        allColumns = columns.concat(allColumns);
        allColumns = allColumns.filter((c, i) => {
          return allColumns.findIndex(a => a.name == c.name) == i;
        });

        return allColumns.filter(c => {
          var v = this.ColumnConfig.create({ of: of, axiom : c }).visibility;
          return v == this.ColumnVisibility.ALWAYS_HIDE ? false :
                 v == this.ColumnVisibility.ALWAYS_SHOW ? true :
                 columns.find(c2 => c.name == c2.name)  ? true : false;
        });
      },
    },
    {
      name: 'allColumns',
      expression: function(of) {
        return ! of ? [] : [].concat(
          of.getAxiomsByClass(foam.core.Property)
            .filter(p => p.tableCellFormatter && ! p.hidden),
          of.getAxiomsByClass(foam.core.Action)
        );
      }
    },
    {
      name: 'columns',
      expression: function(of, allColumns) {
        if ( ! of ) return [];
        var tc = of.getAxiomsByClass(foam.u2.TableColumns)[0];
        return tc ? tc.columns.map(c => of.getAxiomByName(c)) : allColumns;
      },
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
    },
    {
      class: 'Boolean',
      name: 'multiSelectEnabled',
      documentation: 'Set to true to support selecting multiple table rows.'
    },
    {
      class: 'Map',
      name: 'selectedObjects',
      documentation: `
        The objects selected by the user when multi-select support is enabled.
        It's a map where the key is the object id and the value is the object.
      `
    },
    {
      name: 'idsOfObjectsTheUserHasInteractedWith_',
      factory: function() {
        return {};
      }
    },
    {
      name: 'checkboxes_',
      documentation: 'The checkbox elements when multi-select support is enabled. Used internally to implement the select all feature.',
      factory: function() {
        return {};
      }
    },
    {
      class: 'Boolean',
      name: 'togglingCheckBoxes_',
      documentation: 'Used internally to improve performance when toggling all checkboxes on or off.'
    },
    {
      class: 'Boolean',
      name: 'allCheckBoxesEnabled_',
      documentation: 'Used internally to denote when the user has pressed the checkbox in the header to enable all checkboxes.'
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
      var columnSelectionE;

      if ( this.filteredTableColumns$ ) {
        this.onDetach(this.filteredTableColumns$.follow(
          this.columns_$.map((cols) => cols.map((a) => a.name))));
      }

      this.
        addClass(this.myClass()).
        addClass(this.myClass(this.of.id.replace(/\./g, '-'))).
        start().
          addClass(this.myClass('thead')).
          show(this.showHeader$).
          add(this.slot(function(columns_) {
            return this.E().
              addClass(view.myClass('tr')).

              // If multi-select is enabled, then we show a checkbox in the
              // header that allows you to select all or select none.
              callIf(view.multiSelectEnabled, function() {
                var slot = view.SimpleSlot.create();
                this.start().
                  addClass(view.myClass('th')).
                  tag(view.CheckBox, {}, slot).
                  style({ width: '42px' }).
                end();

                // Set up a listener so we can update the existing CheckBox
                // views when a user wants to select all or select none.
                view.onDetach(slot.value.dot('data').sub(function(_, __, ___, newValueSlot) {
                  var checked = newValueSlot.get();
                  view.allCheckBoxesEnabled_ = checked;

                  if ( checked ) {
                    view.selectedObjects = {};
                    view.data.select(function(obj) {
                      view.selectedObjects[obj.id] = obj;
                    });
                  } else {
                    view.selectedObjects = {};
                  }

                  // Update the existing CheckBox views.
                  view.togglingCheckBoxes_ = true;
                  Object.keys(view.checkboxes_).forEach(function(key) {
                    view.checkboxes_[key].data = checked;
                  });
                  view.togglingCheckBoxes_ = false;
                }));
              }).

              // Render the table headers for the property columns.
              forEach(columns_, function(column) {
                this.start().
                  addClass(view.myClass('th')).
                  addClass(view.myClass('th-' + column.name)).
                  call(function() {
                    if ( column.tableWidth ) {
                      this.style({ flex: `0 0 ${column.tableWidth}px` });
                    } else {
                      this.style({ flex: '1 0 0' });
                    }
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

              // Render a th at the end for the column that contains the context
              // menu. If the column-editing feature is enabled, add that to the
              // th we create here.
              call(function() {
                this.start().
                  addClass(view.myClass('th')).
                  style({ flex: '0 0 60px' }).
                  callIf(view.editColumnsEnabled, function() {
                    this.addClass(view.myClass('th-editColumns')).
                    on('click', function(e) {
                      if ( ! view.stack ) return;
                      view.stack.push({
                        class: 'foam.u2.view.EditColumnsView',
                        of: view.of,
                        allColumns: view.allColumns
                      });
                    }).
                    tag(view.Image, { data: '/images/Icon_More_Resting.svg' }).
                    addClass(view.myClass('vertDots')).
                    addClass(view.myClass('noselect'));
                  }).
                  tag('div', null, view.dropdownOrigin$).
                end();
              });
          })).
        end().
        add(this.rowsFrom(this.data$proxy));
    },
    {
      name: 'rowsFrom',
      code: function(dao) {
        /**
         * Given a DAO, add a tbody containing the data from the DAO to the
         * table and return a reference to the tbody.
         *
         * NOTE: This exists so that ScrollTableView can create and manage
         * several different tbody elements inside the TableView it uses. It
         * needs to manage several tbody elements so it can provide performant
         * infinite scroll on tables of any size. So this method exists solely
         * as an implementation detail of ScrollTableView at the time of
         * writing.
         */
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
            E().
            addClass(this.myClass('tbody')).
            select(proxy, function(obj) {
              return this.E().
                addClass(view.myClass('tr')).
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

                // If the multi-select feature is enabled, then we render a
                // Checkbox in the first cell of each row.
                callIf(view.multiSelectEnabled, function() {
                  var slot = view.SimpleSlot.create();
                  this
                    .start()
                      .addClass(view.myClass('td'))
                      .tag(view.CheckBox, { data: view.idsOfObjectsTheUserHasInteractedWith_[obj.id] ? !!view.selectedObjects[obj.id] : view.allCheckBoxesEnabled_ }, slot)
                    .end();

                  // Set up a listener so that when the user checks or unchecks
                  // a box, we update the `selectedObjects` property.
                  view.onDetach(slot.value$.dot('data').sub(function(_, __, ___, newValueSlot) {
                    // If the user is checking or unchecking all boxes at once,
                    // we only want to publish one propertyChange event, so we
                    // trigger it from the listener in the table header instead
                    // of here. This way we prevent a propertyChange being fired
                    // for every single CheckBox's data changing.
                    if ( view.togglingCheckBoxes_ ) return;

                    // Remember that the user has interacted with this checkbox
                    // directly. We need this because the ScrollTableView loads
                    // tbody's in and out while the user scrolls, so we need to
                    // handle the case when a user selects all, then unselects
                    // a particular row, then scrolls far enough that the tbody
                    // the selection was in unloads, then scrolls back into the
                    // range where it reloads. We need to know if they've set
                    // it to something already and we can't simply look at the
                    // value on `selectedObjects` because then we won't know if
                    // `selectedObjects[obj.id] === undefined` means they
                    // haven't interacted with that checkbox or if it means they
                    // explicitly set it to false. We could keep the key but set
                    // the value to null, but that clutters up `selectedObjects`
                    // because some values are objects and some are null. If we
                    // use a separate set to remember which checkboxes the user
                    // has interacted with, then we don't need to clutter up
                    // `selectedObjects`.
                    view.idsOfObjectsTheUserHasInteractedWith_[obj.id] = true;

                    var checked = newValueSlot.get();

                    if ( checked ) {
                      var modification = {};
                      modification[obj.id] = checked ? obj : null;
                      view.selectedObjects = Object.assign({}, view.selectedObjects, modification);
                    } else {
                      var temp = Object.assign({}, view.selectedObjects);
                      delete temp[obj.id];
                      view.selectedObjects = temp;
                    }
                  }));

                  // Store each CheckBox Element in a map so we have a reference
                  // to them so we can set the `data` property of them when the
                  // user checks the box to enable or disable all checkboxes.
                  var checkbox = slot.get();
                  view.checkboxes_[obj.id] = checkbox;
                  checkbox.onDetach(function() {
                    delete view.checkboxes_[obj.id];
                  });
                }).

                forEach(columns_, function(column) {
                  this.
                    start().
                      addClass(view.myClass('td')).
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
                      call(function() {
                        if ( column.tableWidth ) {
                          this.style({ flex: `0 0 ${column.tableWidth}px` });
                        } else {
                          this.style({ flex: '1 0 0' });
                        }
                      }).
                    end();
                }).
                start().
                  addClass(view.myClass('td')).
                  attrs({ name: 'contextMenuCell' }).
                  style({ flex: '0 0 60px' }).
                  tag(view.OverlayActionListView, {
                    data: actions,
                    obj: obj
                  }).
                end();
            });
        });
      }
    }
  ],

});
