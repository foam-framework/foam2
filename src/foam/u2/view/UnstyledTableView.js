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
    'foam.nanos.column.CommonColumnHandler',
    'foam.nanos.column.TableColumnOutputter',
    'foam.u2.md.CheckBox',
    'foam.u2.md.OverlayDropdown',
    'foam.u2.tag.Image',
    'foam.u2.view.EditColumnsView',
    'foam.u2.view.OverlayActionListView'
  ],

  exports: [
    'columns',
    'hoverSelection',
    'selection'
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

  css: `
    ^{
      overflow-y: scroll;
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
      name: 'order'
    },
    {
      name: 'columns_',
      expression: function(columns, of, editColumnsEnabled, selectedColumnNames, allColumns) {
        if ( ! of ) return [];
        var cols;
        if ( ! editColumnsEnabled )
          cols = columns || allColumns;
        else
          cols = selectedColumnNames;
        return this.filterColumnsThatAllColumnsDoesNotIncludeForArrayOfColumns(this, cols).map(c => foam.Array.isInstance(c) ? c : [c, null]);
      },
    },
    {
      name: 'allColumns',
      expression: function(of) {
        return ! of ? [] : [].concat(
          of.getAxiomsByClass(foam.core.Property)
            .filter(p => ! p.hidden && ! p.networkTransient )
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
        return ls || columns;
      }
    },
    {
      name: 'columns',
      expression: function(of, allColumns, isColumnChanged) {
        if ( ! of )
          return [];
        var tc = of.getAxiomByName('tableColumns');
        return tc ? tc.columns : allColumns;
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
      expression: function(props) {
        return this.columns_.reduce((acc, col) => {
          return acc + (this.returnColumnPropertyForPropertyName(this, col, 'tableWidth') || this.MIN_COLUMN_WIDTH_FALLBACK);
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
      expression: function(of, columns_) {
        return this.returnPropertiesForColumns(this, columns_);
      }
    },
    {
      name: 'updateValues',
      class: 'Boolean',
      value: false,
      documentation: 'If isColumnChanged is changed, columns_ will be updated'
    },
    {
      name: 'columnHandler',
      class: 'FObjectProperty',
      of: 'foam.nanos.column.CommonColumnHandler',
      factory: function() {
        return foam.nanos.column.CommonColumnHandler.create();
      }
    },
    {
      name: 'columnConfigToPropertyConverter',
      factory: function() {
        if ( ! this.__context__.columnConfigToPropertyConverter )
          return foam.nanos.column.ColumnConfigToPropertyConverter.create();
        return this.__context__.columnConfigToPropertyConverter;
      }
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
          this.columns_$.map((cols) => this.columnHandler.mapArrayColumnsToArrayOfColumnNames(this, this.filterColumnsThatAllColumnsDoesNotIncludeForArrayOfColumns(this, cols)))
        ));
      }
      this.
        addClass(this.myClass()).
        addClass(this.myClass(this.of.id.replace(/\./g, '-'))).
        start().
          addClass(this.myClass('thead')).
          style({ 'min-width': this.tableWidth_$ }).
          show(this.showHeader$).
          add(this.slot(function(columns_) {
            view.props = this.returnPropertiesForColumns(view, columns_);
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
              forEach(columns_, function([col, overrides]) {
                let found = view.props.find(p => p.fullPropertyName === view.columnHandler.checkIfArrayAndReturnPropertyNamesForColumn(view, col));
                var prop = found ? found.property : view.of.getAxiomByName(view.columnHandler.checkIfArrayAndReturnPropertyNamesForColumn(view, col));
                var isFirstLevelProperty = view.columnHandler.canColumnBeTreatedAsAnAxiom(view, col) ? true : col.indexOf('.') === -1;

                if ( ! prop )
                  return;

                var tableWidth = view.returnColumnPropertyForPropertyName(view, col, 'tableWidth');

                this.start().
                  addClass(view.myClass('th')).
                  addClass(view.myClass('th-' + prop.name))
                  .style({ flex: tableWidth ? `0 0 ${tableWidth}px` : '1 0 0' })
                  .add(view.columnConfigToPropertyConverter.returnColumnHeader(view.of, col)).
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
          return this.slot(function(data, data$delegate, order, updateValues) {
            // Make sure the DAO set here responds to ordering when a user clicks
            // on a table column header to sort by that column.
            if ( this.order ) dao = dao.orderBy(this.order);
            var proxy = view.ProxyDAO.create({ delegate: dao });

            view.props = this.returnPropertiesForColumns(view, view.columns_);

            var propertyNamesToQuery = view.returnPropNamesToQuery(view);
            var valPromises = view.returnRecords(view.of, proxy, propertyNamesToQuery);
            var nastedPropertyNamesAndItsIndexes = view.buildArrayOfNestedPropertyNamesAndCorrespondingIndexesInArray(propertyNamesToQuery);

            var tbodyElement = this.
              E();
              tbodyElement.
              addClass(view.myClass('tbody'));
              valPromises.then(function(values) {

                for ( var i = 0 ; i < values.projection.length ; i++ ) {
                  var obj = values.array[i];
                  var nestedPropertyValues = view.filterOutValuesForNotNestedProperties(values.projection[i], nastedPropertyNamesAndItsIndexes[1]);
                  var nestedPropertiesObjsMap = view.groupObjectsThatAreRelatedToNestedProperties(view.of, nastedPropertyNamesAndItsIndexes[0], nestedPropertyValues);
                  var thisObjValue;
                  var tableRowElement = tbodyElement.E();
                  tableRowElement.
                  addClass(view.myClass('tr')).
                  on('mouseover', function() {
                    if ( !thisObjValue ) {
                      dao.inX(ctrl.__subContext__).find(obj.id).then(v => {
                      thisObjValue = v;//as we here do not have whole info about object we need 
                      view.hoverSelection = thisObjValue;
                    });
                    } else
                      view.hoverSelection = thisObjValue;
                  }).
                  callIf(view.dblclick && ! view.disableUserSelection, function() {
                    tableRowElement.on('dblclick', function() {
                      if ( !thisObjValue ) {
                        dao.inX(ctrl.__subContext__).find(obj.id).then(function(v) {
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
                        dao.inX(ctrl.__subContext__).find(obj.id).then(v => {
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
                    return selection && foam.util.equals(obj.id, selection.id) ?
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
                        if ( !thisObjValue ) {
                          dao.find(obj.id).then(v => {
                            modification[obj.id] = v;
                            view.selectedObjects = Object.assign({}, view.selectedObjects, modification);
                          });
                        } else {
                          modification[obj.id] = thisObjValue;
                          view.selectedObjects = Object.assign({}, view.selectedObjects, modification);
                        }

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
                  });
                  
                  for ( var  j = 0 ; j < view.columns_.length ; j++  ) {
                    var objForCurrentProperty = obj;
                    var propName = view.columnHandler.checkIfArrayAndReturnPropertyNamesForColumn(view, view.columns_[j]);
                    var prop = view.props.find(p => p.fullPropertyName === propName);
                    //check if current column is a nested property
                    //if so get object for it
                    if ( prop && prop.fullPropertyName.includes('.') ) {
                      objForCurrentProperty = nestedPropertiesObjsMap[view.getNestedPropertyNameExcludingLastProperty(prop.fullPropertyName)];
                    }

                    prop = prop ? prop.property : view.of.getAxiomByName(propName);
                    var tableWidth = view.returnColumnPropertyForPropertyName(view, view.columns_[j], 'tableWidth');

                    // var stringValue;
                    var column = typeof view.columns_[j] === 'string' || ! view.columns_[j].tableCellFormatter ? prop : view.columns_[j];
                    // if ( overrides ) column = column.clone().copyFrom(overrides);

                    var elmt = tableRowElement.E().addClass(view.myClass('td')).style({flex: tableWidth ? `0 0 ${tableWidth}px` : '1 0 0'}).
                    callOn(column.tableCellFormatter, 'format', [
                      column.f ? column.f(objForCurrentProperty) : null, objForCurrentProperty, column
                    ]);
                    tableRowElement.add(elmt);
                  }

                  tableRowElement
                    .start()
                      .addClass(view.myClass('td')).
                      attrs({ name: 'contextMenuCell' }).
                      style({ flex: `0 0 ${view.EDIT_COLUMNS_BUTTON_CONTAINER_WIDTH}px` }).
                      tag(view.OverlayActionListView, {
                        data: actions,
                        objId: obj.id,//check if info about obj will suffice here not to retriev it in OverlayActionListView
                        dao: dao
                      }).
                    end();
                  tbodyElement.add(tableRowElement);
                }
              });

              return tbodyElement;
            });
        }
      },
      function returnRecords(of, dao, propertyNamesToQuery) {
        var expr = ( foam.nanos.column.ExpressionForArrayOfNestedPropertiesBuilder.create() ).buildProjectionForPropertyNamesArray(of, propertyNamesToQuery);
        return dao.select(expr);
      },
      function doesAllColumnsContainsColumnName(obj, col) {
        return obj.allColumns.contains(obj.columnHandler.checkIfArrayAndReturnFirstLevelColumnName(obj, col));
      },
      function filterColumnsThatAllColumnsDoesNotIncludeForArrayOfColumns(obj, columns) {
        return columns.filter( c => obj.allColumns.includes( obj.columnHandler.checkIfArrayAndReturnFirstLevelColumnName(obj, c) ));
      },
      function returnTableColumnForColumnName(obj, col) {
        if ( obj.columnHandler.canColumnBeTreatedAsAnAxiom(obj, col) ) {
          return col;
        }
        if ( col.indexOf('.') > -1 ) {
          return null;
        }
        return obj.columns.find( c =>  obj.columnHandler.returnPropertyNamesForColumn(obj, c) === col);
      },
      function getClassForNestedPropertyObject(cls, propNames) {
        var of_ = cls;
        for ( var i = 0 ; i < propNames.length - 1 ; i++ ) {
          of_ = of_.getAxiomByName(propNames[i]).of;
        }
        return of_;
      },
      function groupObjectsThatAreRelatedToNestedProperties(of, arrayOfNestedPropertiesName, arrayOfValues) {
        var map = {};
        for ( var i = 0 ; i < arrayOfNestedPropertiesName.length ; i++ ) {
          var key = this.getNestedPropertyNameExcludingLastProperty(arrayOfNestedPropertiesName[i]);
          var objsClass = this.getClassForNestedPropertyObject(of, arrayOfNestedPropertiesName[i].split('.'));
          if( ! map[key] ) {
            map[key] = objsClass.create();
          }
          objsClass.getAxiomByName(this.getNameOfLastPropertyForNestedProperty(arrayOfNestedPropertiesName[i])).set(map[key], arrayOfValues[i]);
        }
        return map;
      },
      function getNestedPropertyNameExcludingLastProperty(nestedPropertyName) {
        //this method asssumes that the propName is nestedPropertyName
        var lastIndex = nestedPropertyName.lastIndexOf('.');
        return nestedPropertyName.substr(0, lastIndex);//lastIndex == length here
      },
      function getNameOfLastPropertyForNestedProperty(nestedPropertyName) {
        var lastIndex = nestedPropertyName.lastIndexOf('.');
        return nestedPropertyName.substr(lastIndex + 1);
      },
      function buildArrayOfNestedPropertyNamesAndCorrespondingIndexesInArray(propNames) {
        var nestedPropertyNames = [];
        var indexOfValuesForCorrespondingPropertyNames = [];
        for ( var i = 0 ; i < propNames.length ; i++ ) {
          if ( ! propNames[i].includes('.') ) continue;
          nestedPropertyNames.push(propNames[i]);
          indexOfValuesForCorrespondingPropertyNames.push(i);
        }
        var result = [nestedPropertyNames, indexOfValuesForCorrespondingPropertyNames];
        return result;
      },
      function filterOutValuesForNotNestedProperties(valuesArray, indexes) {
        var filteredArr = [];
        for ( var i = 0 ; i < indexes.length; i++ ) {
          filteredArr.push(valuesArray[indexes[i]]);
        }
        return filteredArr;
      },
      function returnPropNamesToQuery(view) {
        var propertyNamesToQuery = view.props.filter(p => foam.core.Property.isInstance(p.property)).map(p => p.fullPropertyName);
        view.props.forEach(p => {
          var propPrefix = ! p.fullPropertyName.includes('.') ? '' : view.getNestedPropertyNameExcludingLastProperty(p.fullPropertyName) + '.';
          if ( foam.core.UnitValue.isInstance(p.property) )
            propertyNamesToQuery.push(propPrefix + p.property.unitPropName);
          for (var i = 0 ; i < p.property.dependsOnPropertiesWithNames.length ; i++ ) {
            propertyNamesToQuery.push(propPrefix + p.property.dependsOnPropertiesWithNames[i]);
          }
        });
        return propertyNamesToQuery;
      },
      function returnColumnPropertyForPropertyName(obj, col, property) {
        var colObj = foam.Array.isInstance(col) ? col[0] : col;

        if ( obj.columnHandler.canColumnBeTreatedAsAnAxiom(obj, colObj) ) {
          if ( colObj[property] )
            return colObj[property];
        }
        var tableColumn = obj.returnTableColumnForColumnName(obj, colObj);
        if ( tableColumn && tableColumn[property] )
          return tableColumn[property];
        var prop = obj.props.find(p => p.fullPropertyName === obj.columnHandler.returnPropertyNamesForColumn(obj, colObj) );
        return  prop ? prop.property[property] : obj.of.getAxiomByName(obj.columnHandler.returnPropertyNamesForColumn(obj, colObj))[property];
      },
      function returnPropertiesForColumns(obj, columns_) {
        var propertyNamesToQuery = columns_.length === 0 ? columns_ : [ 'id' ].concat(obj.filterColumnsThatAllColumnsDoesNotIncludeForArrayOfColumns(obj, columns_).filter(c => ! foam.core.Action.isInstance(obj.of.getAxiomByName(obj.columnHandler.checkIfArrayAndReturnPropertyNamesForColumn(obj, c)))).map(c => obj.columnHandler.checkIfArrayAndReturnPropertyNamesForColumn(obj, c)));
        return obj.returnProperties(obj, propertyNamesToQuery);
      },
      function returnProperties(obj, propertyNamesToQuery) {
        var columnConfig = obj.columnConfigToPropertyConverter;
        if ( ! columnConfig ) columnConfig = obj.ColumnConfigToPropertyConverter.create();
        var result = [];
        for ( var propName of propertyNamesToQuery ) {
          result.push(foam.u2.view.PropertyColumnMapping.create({ fullPropertyName: propName, property: columnConfig.returnProperty(obj.of, propName) }));
        }
        return result;
      },
  ]
});


foam.CLASS({
  package: 'foam.u2.view',
  name: 'PropertyColumnMapping',
  properties: [
    {
      name: 'fullPropertyName',
      class: 'String'
    },
    {
      name: 'property',
      class: 'FObjectProperty',
      of: 'Property',
    }
  ]
});
