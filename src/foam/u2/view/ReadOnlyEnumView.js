/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ReadOnlyEnumView',
  extends: 'foam.u2.View',

  requires: ['foam.u2.tag.CircleIndicator'],

  imports: ['returnExpandedCSS', 'theme'],

  css: `
    ^pill{
      border-radius: 11.2px;
      border: 1px solid;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: normal;
      line-height: 2.1em;
      min-width: 60px;
      padding: 0 12px;
      text-align: center;
      width: -webkit-max-content;
      width: -moz-max-content;
      display: inline-flex;
      justify-content: space-around;
      align-items: center;
    }
    ^icon{
      margin-right: 4px;
    }
  `,

  documentation: 'Creates badges with rounded/squared sides based on display context',

  properties: [
    {
      class: 'Boolean',
      name: 'showGlyph'
    }
  ],

  methods: [
    function initE() {
      var data = this.data;
      this.SUPER();
      var color = this.returnExpandedCSS(this.data.color);
      var background = this.returnExpandedCSS(this.data.background);
      var isPill = this.isFancy(this.data.VALUES);
      this
        .enableClass(this.myClass('pill'), isPill)
        .addClass(this.myClass())
        .style({
          'background-color': background,
          'color': color,
          'border-color': background != '#FFFFFF' || background ? background : color
        })
        .callIf(this.showGlyph && data.glyph, () => {
          var icon = {
            size: 14,
            backgroundColor: color,
            icon: data.glyph.clone(this).getDataUrl({
              fill: background || color
            })
          };
          this.start(this.CircleIndicator, icon).addClass(this.myClass('icon')).end();
        })
        .callIfElse(isPill,
          () => { this.start().add(data.label).end(); },
          () => { this.start('p').add(data.label).end(); }
        );
    },
    {
      name: 'isFancy',
      code: foam.Function.memoize1(function(values) {
        for ( value of values ) {
          if ( value.color || value.background ) { return true; }
        }
      })
    }
  ]
});
