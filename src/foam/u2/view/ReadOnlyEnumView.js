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

  imports: ['theme'],

  css: `
    ^{
      border-radius: 11.2px;
      border: 1px solid;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 10px;
      font-stretch: normal;
      font-style: normal;
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
      this
        .addClass(this.myClass())
        .style({
          'background-color': data.background,
          'color': data.color,
          'border-color': data.background == '#FFFFFF' || ! data.background ? data.color : data.background
        })
        .callIf(this.showGlyph && data.glyph, () =>{
          var icon = {
            size: 14,
            backgroundColor: data.color,
            icon: data.glyph.clone(this).getDataUrl({
              fill: data.background ? data.background : data.color
            })
          };
          this.start(this.CircleIndicator, icon).addClass(this.myClass('icon')).end();
        })
        .start()
          .addClass(this.myClass('label'))
          .add(data.label)
        .end();
    }
  ]
});
