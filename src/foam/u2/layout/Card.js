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
      name: 'cols',
      documentation: `
        Sets up a standard default column width across all display types
      `,
      value: 12
    },
    {
      class: 'Int',
      name: 'xxsCols',
      documentation: `
        The column width for the smaller end of smartphone devices and smartphone portrait screens:
        Max-width @ 320px and an 8 column grid
      `,
      expression: function(cols) {
        return Math.min(8, cols);
      }
    },
    {
      class: 'Int',
      name: 'xsCols',
      documentation: `
        The column width for the regular end of smartphone devices
        Max-width @ 576px, min-width @ 320px and an 8 column grid
      `,
      expression: function(cols) {
        return Math.min(8, cols);
      }
    },
    {
      class: 'Int',
      name: 'smCols',
      documentation: `
        The column width for the larger end of smartphone devices and landscape smartphone screens:
        Max-width @ 768px, min-width @ 576px and a 12 column grid
      `,
      expression: function(cols) {
        return cols;
      }
    },
    {
      class: 'Int',
      name: 'mdCols',
      documentation: `
        The column width for most tablet screens and portrait tablet screens:
        Max-width @ 960px, min-width @ 768px and a 12 column grid
      `,
      expression: function(cols) {
        return cols;
      }
    },
    {
      class: 'Int',
      name: 'lgCols',
      documentation: `
        The column width for the smaller end of desktop screens:
        Max-width @ 1280px, min-width @ 960px and a 12 column grid
      `,
      expression: function(cols) {
        return cols;
      }
    },
    {
      class: 'Int',
      name: 'xlCols',
      documentation: `
        The column width for the majority of desktop screens:
        Max-width @ 1440px, min-width @ 1280px and a 12 column grid
      `,
      expression: function(cols) {
        return cols;
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass());

      // set the default value the xl if display width doesn't exist
      let flex;

      if ( this.displayWidth ) {
        if ( this.displayWidth <= foam.u2.layout.DisplayWidth.XXS ) {
          flex = this.xxsCols / foam.u2.layout.DisplayWidth.XXS.cols;
          
        } else if ( this.displayWidth <= foam.u2.layout.DisplayWidth.XS ) {
          flex = this.xsCols / foam.u2.layout.DisplayWidth.XS.cols;

        } else if ( this.displayWidth <= foam.u2.layout.DisplayWidth.SM ) {
          flex = this.smCols / foam.u2.layout.DisplayWidth.SM.cols;

        } else if ( this.displayWidth <= foam.u2.layout.DisplayWidth.MD ) {
          flex = this.mdCols / foam.u2.layout.DisplayWidth.MD.cols;

        } else if ( this.displayWidth <= foam.u2.layout.DisplayWidth.LG ) {
          flex = this.lgCols / foam.u2.layout.DisplayWidth.LG.cols;
          
        } else if ( this.displayWidth <= foam.u2.layout.DisplayWidth.XL ) {
          flex = this.xlCols / foam.u2.layout.DisplayWidth.XL.cols;

        } else {
          flex = this.xlCols / foam.u2.layout.DisplayWidth.XL.cols;
        }
        
      } else {
        flex = this.xlCols / foam.u2.layout.DisplayWidth.XL.cols;
      }

      this.style({ 'flex-grow': flex })
    }
  ]
});