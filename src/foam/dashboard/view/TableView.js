/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'TableView',
  extends: 'foam.u2.view.UnstyledTableView',

  requires: [
    'foam.comics.v2.DAOBrowserView',
    'foam.u2.stack.Stack'
  ],

  imports: [
    'openFilteredListView'
  ],

  css: `
    ^tbody {
      display: flow-root;
    }

    ^tr {
      background: white;
      display: flex;
      height: 48px;
      justify-content: space-between;
    }

    ^tbody > ^tr {
//      border-left: 1px solid /*%GREY4%*/ #e7eaec;
//      border-right: 1px solid /*%GREY4%*/ #e7eaec;
      border-bottom: 1px solid /*%GREY4%*/ #e7eaec;
    }

    ^tbody > ^tr:hover {
      background: /*%GREY5%*/ #f5f7fa;
      cursor: pointer;
    }

    ^thead {
      border: 1px solid /*%GREY4%*/ #e7eaec;
      border-radius: 5px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
      overflow: hidden;
      position: sticky;
      top: 0;
      overflow-x: scroll;
    }

    ^td,
    ^th {
      align-items: center;
      box-sizing: border-box;
      color: /*%BLACK%*/ #1e1f21;
      display: flex;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      overflow: hidden;
      padding-left: 16px;
      text-align: left;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 40px; /* So when the table's width decreases, columns aren't hidden completely */
    }

    ^th {
      font-weight: 900;
    }

    ^th:not(:last-child) > img {
      margin-left: 8px;
    }

    /**
     * OTHER
     */
    ^selected {
      background: /*%PRIMARY5%*/ #e5f1fc;
    }

    ^noselect {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    ^ .disabled {
      color: #aaa;
    }

    ^td .foam-u2-ActionView {
      padding: 4px 12px;
    }
  `,
  properties: [
    {
      name: 'subStack',
      factory:  function() { return this.Stack.create() },
    },
    {
      name: 'listDaoName'
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .add(this.rowsFrom(this.data$proxy));
    },
    {
      name: 'rowsFrom',
      code: function(dao) {
      var self = this;
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

//          var actions = {};
//          var actionsMerger = action => { actions[action.name] = action; };

          //with this code error created  slot.get cause promise return
          //FIX ME
return this.slot(function(data, data$delegate, order, updateValues) {
            // Make sure the DAO set here responds to ordering when a user clicks
            // on a table column header to sort by that column.
            if ( this.order ) dao = dao.orderBy(this.order);
            var proxy = view.ProxyDAO.create({ delegate: dao });

            view.props = this.returnPropertiesForColumns(view, view.columns_);
            var canObjBeBuildFromProjection = true;

            for ( var p of view.props ) {
              if ( p.property.tableCellFormatter && ! p.property.cls_.hasOwnProperty('tableCellFormatter') ) {
                canObjBeBuildFromProjection = false;
                break;
              }
              if ( ! foam.lookup(p.property.cls_.id) ) {
                canObjBeBuildFromProjection = false;
                break;
              }
            }

            var propertyNamesToQuery = view.columnHandler.returnPropNamesToQuery(view.props);
            var valPromises = view.returnRecords(view.of, proxy, propertyNamesToQuery, canObjBeBuildFromProjection);
            var nastedPropertyNamesAndItsIndexes = view.columnHandler.buildArrayOfNestedPropertyNamesAndCorrespondingIndexesInArray(propertyNamesToQuery);

            var tbodyElement = this.
              E();
              tbodyElement.
              addClass(view.myClass('tbody'));
              valPromises.then(function(values) {

                for ( var i = 0 ; i < values.projection.length ; i++ ) {
                  const obj = values.array[i];
                  var nestedPropertyValues = view.columnHandler.filterOutValuesForNotNestedProperties(values.projection[i], nastedPropertyNamesAndItsIndexes[1]);
                  var nestedPropertiesObjsMap = view.columnHandler.groupObjectsThatAreRelatedToNestedProperties(view.of, nastedPropertyNamesAndItsIndexes[0], nestedPropertyValues);
                  var thisObjValue;
                  var tableRowElement = tbodyElement.E();
                  tableRowElement.
                  addClass(view.myClass('tr')).
                  on('mouseover', function() {
                    view.hoverSelection = obj;
                  }).
                  callIf( ! view.disableUserSelection, function() {
                    tableRowElement.on('click', function(evt) {
                      view.openFilteredListView(obj);
                    });
                  }).
                  addClass(view.slot(function(selection) {
                    return selection && foam.util.equals(obj.id, selection.id) ?
                        view.myClass('selected') : '';
                  })).
                  addClass(view.myClass('row')).
                  style({ 'min-width': view.tableWidth_$ });

                  for ( var  j = 0 ; j < view.columns_.length ; j++  ) {
                    var objForCurrentProperty = obj;
                    var propName = view.columnHandler.checkIfArrayAndReturnPropertyNamesForColumn(view.columns_[j]);
                    var prop = view.props.find(p => p.fullPropertyName === propName);
                    //check if current column is a nested property
                    //if so get object for it
                    if ( prop && prop.fullPropertyName.includes('.') ) {
                      objForCurrentProperty = nestedPropertiesObjsMap[view.columnHandler.getNestedPropertyNameExcludingLastProperty(prop.fullPropertyName)];
                    }

                    prop = objForCurrentProperty ? objForCurrentProperty.cls_.getAxiomByName(view.columnHandler.getNameOfLastPropertyForNestedProperty(propName)) : prop && prop.property ? prop.property : view.of.getAxiomByName(propName);
                    var tableWidth = view.columnHandler.returnPropertyForColumn(view.props, view.of, view.columns_[j], 'tableWidth');

                    var elmt = tableRowElement.E().addClass(view.myClass('td')).
                    callOn(prop.tableCellFormatter, 'format', [
                      prop.f ? prop.f(objForCurrentProperty) : null, objForCurrentProperty, prop
                    ]);
                    tableRowElement.add(elmt);
                  }

                  // Object actions
//                  obj.cls_.getOwnAxiomsByClass(foam.core.Action).forEach(actionsMerger);
                  tbodyElement.add(tableRowElement);
                }
              });

              return tbodyElement;
            });
        }
      },
  ]
});
