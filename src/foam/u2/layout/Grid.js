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

  requires: [
    'foam.u2.layout.GUnit'
  ],

  css: `
    ^ {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
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
    },

    function createChild_(spec, args){
      var ret = this.SUPER(spec, args);

      var width = this.GUnit.isInstance(ret) ? ret.columns : 12;

      var startCol = this.currentWidth + 1;
      this.currentWidth += width;

      if ( this.currentWidth > 12 ) {
        startCol = 1;
        this.currentWidth = width;
      }

      var endCol = startCol + width;

      ret.style({
        'background-color': 'pink',
        'grid-column-start': startCol,
        'grid-column-end': endCol,
      });

      return ret;
    }
  ]
});
