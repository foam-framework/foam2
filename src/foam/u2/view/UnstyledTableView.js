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
    'foam.nanos.column.ColumnConfigToPropertyConverter',
    'foam.nanos.column.TableColumnOutputter',
    'foam.u2.md.CheckBox',
    'foam.u2.md.OverlayDropdown',
    'foam.u2.view.OverlayActionListView',
    'foam.u2.view.EditColumnsView',
    'foam.u2.view.ColumnConfig',
    'foam.u2.view.ColumnVisibility',
    'foam.u2.tag.Image',
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

  constants: [
    {
      type: 'Int',
      name: 'MIN_COLUMN_WIDTH_FALLBACK',
      value: 100
    },
    {
      type: 'Int',
      name: 'EDIT_COLUMNS_BUTTON_CONTAINER_WIDTH',
      value: 60
    }
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
      expression: function(columns, of, editColumnsEnabled, selectedColumnNames, allColumns) {
        if ( ! of ) return [];
        var cols;
        if ( ! editColumnsEnabled ) cols = columns;
        else cols = selectedColumnNames;
        return cols.filter( c => allColumns.includes(foam.String.isInstance(c) ? ( c.indexOf('.') > -1 ? c.split('.')[0] : c ) : columns.name )).map(c => foam.Array.isInstance(c) ? c : [c, null]);
      },
    },
    {
      name: 'allColumns',
      expression: function(of) {
        return ! of ? [] : [].concat(
          of.getAxiomsByClass(foam.core.Property)
            .filter(p => p.tableCellFormatter && ! p.hidden && ! p.networkTransient )
            .map(a => a.name),
          of.getAxiomsByClass(foam.core.Action)
            .map(a => a.name)
        );
      }
    },
    {
      name: 'selectedColumnNames',
      expression: function(columns, of) {
        var ls = JSON.parse(localStorage.getItem(of.id));
        return ls ? ls : columns;
      }
    },
    {
      name: 'columns',
      expression: function(of, allColumns, isColumnChanged) {
        if ( ! of ) return [];
        var tc = of.getAxiomByName('tableColumns');
        return tc ? tc.columns : allColumns;
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
      value: '/images/resting-arrow.svg'
    },
    {
      name: 'ascIcon',
      documentation: 'Image for table header ascending sorting arrow',
      value: '/images/up-arrow.svg'
    },
    {
      name: 'descIcon',
      documentation: 'Image for table header descending sorting arrow',
      value: '/images/down-arrow.svg'
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
    },
    {
      class: 'Int',
      name: 'tableWidth_',
      documentation: 'Width of the whole table. Used to get proper scrolling on narrow screens.',
      expression: function(of, columns_) {
        return columns_.reduce((acc, col) => {
          var cls = of;
          var axiom;

          if ( foam.String.isInstance(col[0]) ) {
            axiom = this.columns.find(c => c.name ===  col[0]);
            if ( ! axiom ) {
              var props = col[0].split('.');
              for ( var i = 0 ; i < props.length ; i++ ) {
                axiom = foam.String.isInstance(props[i])
                ? cls.getAxiomByName(props[i])
                :  foam.Array.isInstance(props[i]) ?
                cls.getAxiomByName(props[i]) : props[i];
                if ( ! axiom ) {
                  break;
                }
                cls = axiom.of;
              }
            }
          } else
            axiom = col[0];

          return acc + (axiom.tableWidth || this.MIN_COLUMN_WIDTH_FALLBACK);
        }, this.EDIT_COLUMNS_BUTTON_CONTAINER_WIDTH) + 'px';
      }
    },
    {
      name: 'isColumnChanged',
      class: 'Boolean',
      value: false,
      documentation: 'If isColumnChanged is changed, columns_ will be updated'
    },
    {
      name: 'outputter',
      factory: function() {
        return this.TableColumnOutputter.create();
      }
    },
    {
      name: 'props',
      expression: function(columns_) {
        var propertyNamesToQuery = columns_.length === 0 ? columns_ : [ 'id' ].concat(columns_.map(([c, overrides]) => foam.core.Property.isInstance(c) ? c.name : c));
        return this.returnProperties(this, propertyNamesToQuery);
      }
    },
    {
      name: 'updateValues',
      class: 'Boolean',
      value: false,
      documentation: 'If isColumnChanged is changed, columns_ will be updated'
    }
  ],

  methods: [
    function sortBy(column) {
      this.order = this.order === column ?
        this.DESC(column) :
        column;
    },

    function updateColumns() {
      localStorage.removeItem(this.of.id);
      localStorage.setItem(this.of.id, JSON.stringify(this.selectedColumnNames.map(c => foam.String.isInstance(c) ? c : c.name )));
      this.isColumnChanged = ! this.isColumnChanged;
    },

    async function initE() {
      var view = this;

      //otherwise on adding new column creating new EditColumnsView, which is closed by default
      if (view.editColumnsEnabled)
        var editColumnView = foam.u2.view.EditColumnsView.create({data:view});

      if ( this.filteredTableColumns$ ) {
        this.onDetach(this.filteredTableColumns$.follow(
          //to not export "custom" table columns
          this.columns_$.map((cols) => cols.filter(([axiomOrColumnName, overrides]) => view.allColumns.includes(foam.String.isInstance(axiomOrColumnName) ? ( axiomOrColumnName.indexOf('.') > -1 ? axiomOrColumnName.split('.')[0] : axiomOrColumnName ) : axiomOrColumnName.name )).map(([axiomOrColumnName, overrides]) => {
            return foam.String.isInstance(axiomOrColumnName) ? axiomOrColumnName : axiomOrColumnName.name;
          }))));
      }
      this.
        addClass(this.myClass()).
        addClass(this.myClass(this.of.id.replace(/\./g, '-'))).
        start().
          addClass(this.myClass('thead')).
          style({ 'min-width': this.tableWidth_$ }).
          show(this.showHeader$).
          add(this.slot(function(columns_) {
            var propertyNamesToQuery = view.columns_.length === 0 ? view.columns_ : [ 'id' ].concat(view.columns_.map(([c, overrides]) => c));
            view.props = view.returnProperties(view, propertyNamesToQuery);
            view.updateValues = ! view.updateValues;

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
                    view.data.select(function(obj) {//FIX ME
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
              forEach(columns_, function([col, overrides]) {
                var prop;
                var isFirstLevelProperty = true;
                if ( ! foam.core.FObject.isInstance(col) ) {
                  var propertyNames = col.split('.');
                  isFirstLevelProperty = propertyNames.length === 1;
                  prop = view.props.find(c => c.name === propertyNames[propertyNames.length - 1]);
                } else
                  prop = view.props.find(c => c.name === col.name);
                var column = view.columns.find( c => !foam.String.isInstance(c) && c.name === prop.name );

                this.start().
                  addClass(view.myClass('th')).
                  addClass(view.myClass('th-' + prop.name)).
                  call(function() {
                    if ( prop.tableWidth || ( column && column.tableWidth ) ) {
                      this.style({ flex: `0 0 ${column && column.tableWidth ? column.tableWidth : prop.tableWidth}px` });
                    } else {
                      this.style({ flex: '1 0 0' });
                    }
                  }).
                  call(column && column.tableHeaderFormatter ? column.tableHeaderFormatter : prop.tableHeaderFormatter, [column && column.tableHeaderFormatter ? column : prop]).
                  callIf(isFirstLevelProperty && prop.sortable, function() {
                    this.on('click', function(e) {
                      view.sortBy(prop);
                      }).
                      callIf(prop.label !== '', function() {
                        this.start('img').attr('src', this.slot(function(order) {
                          return prop === order ? view.ascIcon :
                              ( view.Desc.isInstance(order) && order.arg1 === prop )
                              ? view.descIcon : view.restingIcon;
                        }, view.order$)).end();
                    });
                  }).
                end();
              }).

              // Render a th at the end for the column that contains the context
              // menu. If the column-editing feature is enabled, add that to the
              // th we create here.
              call(function() {
                this.start().
                  addClass(view.myClass('th')).
                  style({ flex: `0 0 ${view.EDIT_COLUMNS_BUTTON_CONTAINER_WIDTH}px` }).
                  callIf(view.editColumnsEnabled, function() {
                    this.addClass(view.myClass('th-editColumns'))
                    .on('click', function(e) {
                      editColumnView.parentId = this.id;
                      if ( ! editColumnView.selectColumnsExpanded )
                        editColumnView.selectColumnsExpanded = ! editColumnView.selectColumnsExpanded;
                    }).
                    tag(view.Image, { data: '/images/Icon_More_Resting.svg' }).
                    addClass(view.myClass('vertDots')).
                    addClass(view.myClass('noselect'))
                    ;
                  }).
                  tag('div', null, view.dropdownOrigin$).
                end();
              });
            })).
        end().
        callIf(view.editColumnsEnabled, function() {this.add(editColumnView);}).
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

          var modelActions = view.of.getAxiomsByClass(foam.core.Action);
          var actions = Array.isArray(view.contextMenuActions)
            ? view.contextMenuActions.concat(modelActions)
            : modelActions;

          //with this code error created  slot.get cause promise return
          //FIX ME
          return this.slot(function(order, updateValues) {
            var propertyNamesToQuery = view.columns_.length === 0 ? view.columns_ : [ 'id' ].concat(view.columns_.map(([c, overrides]) => ! foam.core.Property.isInstance(c) ? c : c.name));
            view.props = view.returnProperties(view, propertyNamesToQuery);

            var unitValueProperties = view.props.filter( p => foam.core.UnitValue.isInstance(p) );

            var numberOfColumns = propertyNamesToQuery.length;

            // Make sure the DAO set here responds to ordering when a user clicks
            // on a table column header to sort by that column.
            if ( this.order ) dao = dao.orderBy(this.order);
            var proxy = view.ProxyDAO.create({ delegate: dao });

            //to retrieve value of unitProp
            unitValueProperties.forEach(p => propertyNamesToQuery.push(p.unitPropName));
            var valPromises = view.returnRecords(proxy, propertyNamesToQuery);

            var tbodyElement = this.
              E();
              tbodyElement.
              addClass(view.myClass('tbody'));
              valPromises.then(function(values) {

                tbodyElement.forEach(values.array, function(val) {
                  var thisObjValue;
                  var tableRowElement = this.E();
                  tableRowElement.
                  addClass(view.myClass('tr')).
                  on('mouseover', function() {
                    if ( !thisObjValue ) {
                      dao.find(val[0]).then(v => {
                      thisObjValue = v;
                      view.hoverSelection = thisObjValue;
                    });
                    } else
                      view.hoverSelection = thisObjValue;
                  }).
                  callIf(view.dblclick && ! view.disableUserSelection, function() {
                    tableRowElement.on('dblclick', function() {
                      if ( !thisObjValue ) {
                        dao.find(val[0]).then(function(v) {
                          thisObjValue = v;
                          view.dblclick && view.dblclick(thisObjValue);
                        });
                      } else
                        view.dblclick && view.dblclick(thisObjValue);
                    });
                  }).
                  callIf( ! view.disableUserSelection, function() {
                    tableRowElement.on('click', function(evt) {
                      // If we're clicking somewhere to close the context menu,
                      // don't do anything.
                      if (
                        evt.target.nodeName === 'DROPDOWN-OVERLAY' ||
                        evt.target.classList.contains(view.myClass('vertDots'))
                      ) return;

                      if  ( !thisObjValue ) {
                        dao.find(val[0]).then(v => {
                          view.selection = v;
                          if ( view.importSelection$ ) view.importSelection = v;
                          if ( view.editRecord$ ) view.editRecord(v);
                        });
                      } else {
                        if ( view.importSelection$ ) view.importSelection = thisObjValue;
                        if ( view.editRecord$ ) view.editRecord(thisObjValue);
                      }
                    });
                  }).
                  addClass(view.slot(function(selection) {
                    return selection && foam.util.equals(val[0], selection.id) ?
                        view.myClass('selected') : '';
                  })).
                  addClass(view.myClass('row')).
                  style({ 'min-width': view.tableWidth_$ }).

                  // If the multi-select feature is enabled, then we render a
                  // Checkbox in the first cell of each row.
                  callIf(view.multiSelectEnabled, function() {
                    var slot = view.SimpleSlot.create();
                    tableRowElement
                      .start()
                        .addClass(view.myClass('td'))
                        .tag(view.CheckBox, { data: view.idsOfObjectsTheUserHasInteractedWith_[val[0]] ? !!view.selectedObjects[val[0]] : view.allCheckBoxesEnabled_ }, slot)
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
                      view.idsOfObjectsTheUserHasInteractedWith_[val[0]] = true;

                      var checked = newValueSlot.get();

                      if ( checked ) {
                        var modification = {};
                        if ( !thisObjValue ) {
                          dao.find(val[0]).then(v => {
                            modification[val[0]] = v;
                            view.selectedObjects = Object.assign({}, view.selectedObjects, modification);
                          });
                        } else {
                          modification[val[0]] = thisObjValue;
                          view.selectedObjects = Object.assign({}, view.selectedObjects, modification);
                        }

                      } else {
                        var temp = Object.assign({}, view.selectedObjects);
                        delete temp[val[0]];
                        view.selectedObjects = temp;
                      }
                    }));

                    // Store each CheckBox Element in a map so we have a reference
                    // to them so we can set the `data` property of them when the
                    // user checks the box to enable or disable all checkboxes.
                    var checkbox = slot.get();
                    view.checkboxes_[val[0]] = checkbox;
                    checkbox.onDetach(function() {
                      delete view.checkboxes_[val[0]];
                    });
                  });
                  for ( var  i = 1 ; i < numberOfColumns ; i++  ) {
                    var column = view.columns.find( c => !foam.String.isInstance(c) && c.name === view.props[i].name );
                    if ( ( view.props[i].tableCellFormatter || ( column && column.tableCellFormatter ) ) && val[i] ) {
                      var elmt = this.E().addClass(view.myClass('td')).style({flex: column && column.tableWidth ? `0 0 ${column.tableWidth}px` : view.props[i] && view.props[i].tableWidth  ? `0 0 ${view.props[i].tableWidth}px` : '1 0 0'});//, 'justify-content': 'center'
                      try {
                        if ( column && column.tableCellFormatter )
                          column.tableCellFormatter.format(elmt, val[i], null);
                        else
                          view.props[i].tableCellFormatter.format(elmt, val[i], null);
                        tableRowElement.add(elmt);
                        continue;
                      } catch(e) {}
                    }
                    var stringValue;
                    if ( foam.core.UnitValue.isInstance(view.props[i]) ) {
                      var indexOfUnitName = propertyNamesToQuery.indexOf(view.props[i].unitPropName);
                      stringValue = view.outputter.returnStringValueForProperty(view.__context__, view.props[i], val[i], val[indexOfUnitName]);
                    } else {
                      stringValue = view.outputter.returnStringValueForProperty(view.__context__, view.props[i], val[i]);
                    }
                    tableRowElement.start().addClass(view.myClass('td'))
                    .add(stringValue)
                    .style({flex: column && column.tableWidth ? `0 0 ${column.tableWidth}px` : view.props[i] && view.props[i].tableWidth  ? `0 0 ${view.props[i].tableWidth}px` : '1 0 0'}).end();
                  }
                  tableRowElement
                    .start()
                      .addClass(view.myClass('td')).
                      attrs({ name: 'contextMenuCell' }).
                      style({ flex: `0 0 ${view.EDIT_COLUMNS_BUTTON_CONTAINER_WIDTH}px` }).
                      tag(view.OverlayActionListView, {
                        data: actions,
                        objId: val[0],
                        dao: dao
                      }).
                    end();
                  tbodyElement.add(tableRowElement);
                });
              });

              return tbodyElement;
            });
        }
      },
      function returnRecords(dao, propertyNamesToQuery) {
        var expr = ( foam.nanos.column.ExpressionForArrayOfNestedPropertiesBuilder.create() ).buildProjectionForPropertyNamesArray(dao.of, propertyNamesToQuery);
        return dao.select(expr);
      },
      function returnProperties(obj, propertyNamesToQuery) {
        var columnConfig = obj.__context__.columnConfigToPropertyConverter;
        if ( ! columnConfig ) columnConfig = obj.ColumnConfigToPropertyConverter.create();
        return columnConfig.returnProperties(obj.of, propertyNamesToQuery);
      }
  ],

});
