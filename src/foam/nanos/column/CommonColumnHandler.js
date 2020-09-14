foam.CLASS({
  package: 'foam.nanos.column',
  name: 'CommonColumnHandler',
  methods: [
    function returnColumnNameForNLevelName(context, col, n) {
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
    function checkIfArrayAndReturnPropertyNamesForColumn(context, col) {
      return context.columnHandler.returnPropertyNamesForColumn(context, context.columnHandler.returnNElementIfArray(col, 0));
    },
    function returnPropertyNamesForColumn(context, col) {
      return context.columnHandler.canColumnBeTreatedAsAnAxiom(context, col) ? col.name : col;
    },
    function checkIfArrayAndReturnColumnLastLevelName(context, col) {
      return context.columnHandler.returnColumnLastLevelName(context, context.columnHandler.returnNElementIfArray(col, 0));
    },
    function returnColumnLastLevelName(context, col) {
      return context.columnHandler.canColumnBeTreatedAsAnAxiom(context, col) ? col.name : context.columnHandler.returnColumnNameForNLevelName(context, col, -1);
    },
    function checkIfArrayAndReturnFirstLevelColumnName(context, col) {
      return context.columnHandler.returnColumnFirstLevelName(context, context.columnHandler.returnNElementIfArray(col, 0));
    },
    function returnColumnFirstLevelName(context, col) {
      return context.columnHandler.canColumnBeTreatedAsAnAxiom(context, col) ? col.name : context.columnHandler.returnColumnNameForNLevelName(context, col, 0);
    },
    function returnNElementIfArray(col, n) {
      return foam.Array.isInstance(col) ? col[n] : col;
    },
    function canColumnBeTreatedAsAnAxiom(context, col) {
      return foam.core.Property.isInstance(col) || foam.core.Action.isInstance(col) || foam.Object.isInstance(col);
    },
    function mapArrayColumnsToArrayOfColumnNames(context, cols) {
      return cols.map(c => context.columnHandler.checkIfArrayAndReturnPropertyNamesForColumn(context, c));
    },
    function checkIfArrayAndReturnPropertyNameForRootProperty(context, rootProperty) {
      return context.columnHandler.returnPropertyNameForRootProperty(context, context.columnHandler.returnNElementIfArray(rootProperty, 0));
    },
    function returnPropertyNameForRootProperty(context, rootProperty) {
      return context.columnHandler.canColumnBeTreatedAsAnAxiom(context, rootProperty) ? rootProperty.name : rootProperty;
    },
    function checkIfArrayAndReturnRootPropertyHeader(context, rootProperty) {
      return context.columnHandler.returnRootPropertyHeader(context, context.columnHandler.returnNElementIfArray(rootProperty, 1));
    },
    function returnRootPropertyHeader(context, rootProperty) {
      return context.columnHandler.canColumnBeTreatedAsAnAxiom(context, rootProperty) ?  context.columnHandler.returnAxiomHeader(rootProperty) : rootProperty;
    },
    function checkIfArrayAndReturnAxiomHeader(context, rootProperty) {
      return context.columnHandler.returnAxiomHeader(context, context.columnHandler.returnNElementIfArray(rootProperty, 0));
    },
    function returnAxiomHeader(axiom) {
      return axiom.tableHeader  ? axiom.tableHeader() : axiom.label;
    }
  ]
});
