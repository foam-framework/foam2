/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'GridColumns',
  extends: 'foam.u2.Element',
  documentation: `
    A model for the sizes of grid columns 
  `,
  
  properties: [
    {
      class: 'Int',
      name: 'columns',
      documentation: `
        Sets up a standard default column width across all display types
      `,
      value: 12
    },
    {
      class: 'Int',
      name: 'xxsColumns',
      documentation: `
        The column width for the smaller end of smartphone devices and smartphone portrait screens using an 8 column grid
      `,
      expression: function(columns) {
        return Math.min(8, columns);
      }
    },
    {
      class: 'Int',
      name: 'xsColumns',
      documentation: `
        The column width for the regular end of smartphone devices using an 8 column grid
      `,
      expression: function(columns) {
        return Math.min(8, columns);
      }
    },
    {
      class: 'Int',
      name: 'smColumns',
      documentation: `
        The column width for the larger end of smartphone devices and landscape smartphone screens using a 12 column grid
      `,
      expression: function(columns) {
        return columns;
      }
    },
    {
      class: 'Int',
      name: 'mdColumns',
      documentation: `
        The column width for most tablet screens and portrait tablet screens using a 12 column grid
      `,
      expression: function(columns) {
        return columns;
      }
    },
    {
      class: 'Int',
      name: 'lgColumns',
      documentation: `
        The column width for the smaller end of desktop screens using a 12 column grid
      `,
      expression: function(columns) {
        return columns;
      }
    },
    {
      class: 'Int',
      name: 'xlColumns',
      documentation: `
        The column width for the majority of desktop screens using a 12 column grid
      `,
      expression: function(columns) {
        return columns;
      }
    }
  ],
});

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'PropertyGridRefinement',
  refines: 'foam.core.Property',
  properties: [
    {
      name: 'gridColumns'
    }
  ]
})