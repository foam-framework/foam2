/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'Element',
});
foam.CLASS({
  package: 'foam.u2',
  name: 'CSS',
  properties: [ 'code' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'View',
});
foam.CLASS({
  refines: 'foam.core.Model',
  properties: [ 'tableProperties', 'tableColumns', 'generateJava', 'searchColumns', 'tableCellFormatter', 'css' ]
});
foam.CLASS({
  refines: 'foam.core.Currency',
  properties: [ 'tableCellFormatter' ]
});
foam.CLASS({
  refines: 'foam.core.Double',
  properties: [ 'tableCellFormatter' ]
});
foam.CLASS({
  refines: 'foam.core.Long',
  properties: [ 'tableCellFormatter', 'visibility', 'tableWidth' ]
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
  refines: 'foam.core.Property',
  properties: [ 'tableCellFormatter', 'searchView' ]
});
foam.CLASS({
  refines: 'foam.core.FObjectProperty',
  properties: [ 'view' ]
});
foam.CLASS({
  refines: 'foam.core.Boolean',
  properties: [ 'tableCellFormatter', 'tableCellView', 'tableWidth' ]
});
foam.CLASS({
  refines: 'foam.core.String',
  properties: [ 'tableCellFormatter', 'tableCellView', 'displayWidth', 'view', 'visibility', 'tableWidth' ]
});
foam.CLASS({
  refines: 'foam.core.Method',
  properties: [ 'javaCode' ]
});