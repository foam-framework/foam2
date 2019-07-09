/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'Card',
  extends: 'foam.u2.borders.CardBorder',
  documentation: `
    A card based on a responsive grid system
  `,

  imports: [
    'displayWidth?'
  ],

  css: `
    ^ {
      margin: 8px;
    }
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

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass());

      // need to bind the flex value to displayWidth because it can change
      this.style({
        'flex-grow': this.displayWidth$.map(dw => {
          dw = dw || foam.u2.layout.DisplayWidth.XL;
          return this[`${dw.name.toLowerCase()}Columns`] / dw.cols;
        })
      })
    }
  ]
});
