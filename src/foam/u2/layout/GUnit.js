/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'GUnit',
  extends: 'foam.u2.Element',
  documentation: `
    A Grid Unit based on a responsive grid system
  `,

  requires: [
    'foam.u2.layout.GridColumns'
  ],
  
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.u2.layout.GridColumns',
      name: 'columns',
      documentation: `
        Sets up a standard default column width across all display types
      `,
      adapt: function(_, n){
        if ( foam.Number.isInstance(n) ) {
          return this.GridColumns.create({
            columns: n
          })
        }
        return n;
      }
    }
  ],
});
