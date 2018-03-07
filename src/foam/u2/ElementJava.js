/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  refines: 'foam.core.Boolean',
  properties: [ 'tableCellFormatter', 'tableCellView', 'tableWidth', 'attribute' ]
});
foam.CLASS({
  refines: 'foam.core.Currency',
  properties: [ 'tableCellFormatter' , 'precision' ]
});
foam.CLASS({
  refines: 'foam.core.Date',
  properties: [ 'tableCellFormatter' ]
});
foam.CLASS({
  refines: 'foam.core.DateTime',
  properties: [ 'tableCellFormatter', 'visibility' ]
});
foam.CLASS({
  refines: 'foam.core.Double',
  properties: [ 'tableCellFormatter' ]
});
foam.CLASS({
  refines: 'foam.core.Float',
  properties: [ 'view' ]
});
foam.CLASS({
  refines: 'foam.core.FObjectProperty',
  properties: [ 'view' ]
});
foam.CLASS({
  refines: 'foam.core.Int',
  properties: [ 'attribute' ]
});
foam.CLASS({
  refines: 'foam.core.Long',
  properties: [ 'tableCellFormatter', 'visibility', 'tableWidth' ]
});
foam.CLASS({
  refines: 'foam.core.Method',
  properties: [ 'javaCode' ]
});
foam.CLASS({
  refines: 'foam.core.Model',
  properties: [ 'tableProperties', 'tableColumns', 'generateJava', 'searchColumns', 'tableCellFormatter', 'css', 'import' ]
});
foam.CLASS({
  refines: 'foam.core.Property',
  properties: [ 'tableCellFormatter', 'searchView', 'attribute', 'view' ]
});
foam.CLASS({
  refines: 'foam.core.Reference',
  properties: [ 'view' ]
});
foam.CLASS({
  refines: 'foam.core.String',
  properties: [ 'tableCellFormatter', 'tableCellView', 'displayWidth', 'view', 'visibility', 'tableWidth' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'CSS',
  properties: [ 'code' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'Element',
});
foam.CLASS({
  package: 'foam.u2',
  name: 'View',
});
