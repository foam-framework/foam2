/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'Grid',
  extends: 'foam.u2.Element',
  documentation: `
    A grid of responsive elements
  `,

  imports: [
    'displayWidth?'
  ],

  requires: [
    'foam.u2.layout.GUnit'
  ],

  css: `
    ^ {
      display: grid;
      grid-column-gap: 16px;
      grid-row-gap: 32px;
    }
  `,

  properties: [
    {
      class: 'Int',
      name: 'currentWidth',
      value: 0
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
      this.style(
        { 'grid-template-columns': this.displayWidth$.map(dw => {
            dw = dw || foam.u2.layout.DisplayWidth.XL;
            return `repeat(${dw.cols}, 1fr)`;
          })
        }
      )
    },

    function createChild_(spec, args){
      var ret = this.SUPER(spec, args);

      var width = this.GUnit.isInstance(ret) 
        ? ret[`${this.displayWidth.name.toLowerCase()}Columns`] 
        : this.displayWidth.cols;

      var startCol = this.currentWidth + 1;
      this.currentWidth += width;

      if ( this.currentWidth > this.displayWidth.cols ) {
        startCol = 1;
        this.currentWidth = width;
      }

      var endCol = startCol + width;

      ret.style({
        'grid-column-start': startCol,
        'grid-column-end': endCol
      });

      return ret;
    }
  ]
});
