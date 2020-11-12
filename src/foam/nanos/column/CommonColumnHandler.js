foam.CLASS({
  package: 'foam.nanos.column',
  name: 'CommonColumnHandler',
  requires: [
    'foam.nanos.column.ColumnConfigToPropertyConverter'
  ],
  methods: [
    function returnColumnNameForNLevelName(col, n) {
      if ( ! col.split ) return null;
      var propNames = col.split('.');
      if ( n === -1 ) {
        if ( propNames.length === 0 )
          n = 0;
        else
          n = propNames.length - 1;
      }
      return propNames[n];
    },
    function checkIfArrayAndReturnPropertyNamesForColumn(col) {
      return this.returnPropertyNamesForColumn(this.returnNElementIfArray(col, 0));
    },
    function returnPropertyNamesForColumn(col) {
      return this.canColumnBeTreatedAsAnAxiom(col) ? col.name : col;
    },
    function checkIfArrayAndReturnColumnLastLevelName(col) {
      return this.returnColumnLastLevelName(this.returnNElementIfArray(col, 0));
    },
    function returnColumnLastLevelName(col) {
      return this.canColumnBeTreatedAsAnAxiom(col) ? col.name : this.returnColumnNameForNLevelName(col, -1);
    },
    function checkIfArrayAndReturnFirstLevelColumnName(col) {
      return this.returnColumnFirstLevelName(this.returnNElementIfArray(col, 0));
    },
    function returnColumnFirstLevelName(col) {
      return this.canColumnBeTreatedAsAnAxiom(col) ? col.name : this.returnColumnNameForNLevelName(col, 0);
    },
    function returnNElementIfArray(col, n) {
      return foam.Array.isInstance(col) ? col[n] : col;
    },
    function canColumnBeTreatedAsAnAxiom(col) {
      return foam.core.Property.isInstance(col) || foam.core.Action.isInstance(col) || foam.Object.isInstance(col);
    },
    function mapArrayColumnsToArrayOfColumnNames(cols) {
      return cols.map(c => this.checkIfArrayAndReturnPropertyNamesForColumn(c));
    },
    function checkIfArrayAndReturnPropertyNameForRootProperty(rootProperty) {
      return this.returnPropertyNameForRootProperty(this.returnNElementIfArray(rootProperty, 0));
    },
    function returnPropertyNameForRootProperty(rootProperty) {
      return this.canColumnBeTreatedAsAnAxiom(rootProperty) ? rootProperty.name : rootProperty;
    },
    function checkIfArrayAndReturnRootPropertyHeader(rootProperty) {
      return this.returnRootPropertyHeader(this.returnNElementIfArray(rootProperty, 1));
    },
    function returnRootPropertyHeader(rootProperty) {
      return this.canColumnBeTreatedAsAnAxiom(rootProperty) ?  this.returnAxiomHeader(rootProperty) : rootProperty;
    },
    function checkIfArrayAndReturnAxiomHeader(rootProperty) {
      return this.returnAxiomHeader(this.returnNElementIfArray(rootProperty, 0));
    },
    function returnAxiomHeader(axiom) {
      return axiom.tableHeader  ? axiom.tableHeader() : axiom.label;
    },
    function getClassForNestedPropertyObject(cls, propNames) {
      var of_ = cls;
      for ( var i = 0 ; i < propNames.length - 1 ; i++ ) {
        of_ = of_.getAxiomByName(propNames[i]).of;
      }
      return of_;
    },
    function returnPropNamesToQuery(props) {
      var propertyNamesToQuery = props.filter(p => foam.core.Property.isInstance(p.property)).map(p => p.fullPropertyName);
      props.forEach(p => {
        var propPrefix = ! p.fullPropertyName.includes('.') ? '' : this.getNestedPropertyNameExcludingLastProperty(p.fullPropertyName) + '.';
        if ( foam.core.UnitValue.isInstance(p.property) && p.property.unitPropName)
          propertyNamesToQuery.push(propPrefix + p.property.unitPropName);
        for (var i = 0 ; i < p.property.dependsOnPropertiesWithNames.length ; i++ ) {
          propertyNamesToQuery.push(propPrefix + p.property.dependsOnPropertiesWithNames[i]);
        }
      });
      return propertyNamesToQuery;
    },
    function returnPropertyForColumn(props, of, col, property) {
      var colObj = foam.Array.isInstance(col) ? col[1] && col[1][property] ? col[1] : col[0] : col ;

      if ( colObj && this.canColumnBeTreatedAsAnAxiom(colObj) ) {
        if ( colObj[property] )
          return colObj[property];
      }
      var prop = props.find(p => p.fullPropertyName ===this.returnPropertyNamesForColumn(colObj) );
      return  prop ? prop.property[property] : of.getAxiomByName(this.returnPropertyNamesForColumn(colObj))[property];
    },
    function groupObjectsThatAreRelatedToNestedProperties(of, arrayOfNestedPropertiesName, arrayOfValues) {
      var map = {};
      for ( var i = 0 ; i < arrayOfNestedPropertiesName.length ; i++ ) {
        var key = this.getNestedPropertyNameExcludingLastProperty(arrayOfNestedPropertiesName[i]);
        var objsClass = this.getClassForNestedPropertyObject(of, arrayOfNestedPropertiesName[i].split('.'));
        if( ! map[key] ) {
          map[key] = objsClass.create();
        }
        if ( arrayOfValues[i] )
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
        if ( ! propNames[i].includes('.') )
          continue;
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
  ]
});
