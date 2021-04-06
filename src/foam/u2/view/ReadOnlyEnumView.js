/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ReadOnlyEnumView',
  extends: 'foam.u2.View',

  css: `
    ^{
      border-radius: 11.2px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 10px;
      font-stretch: normal;
      font-style: normal;
      font-weight: 500;
      letter-spacing: normal;
      line-height: 24px;
      min-width: 60px;
      padding: 0 12px;
      text-align: center;
      width: -webkit-max-content;
      width: -moz-max-content;
    }
  `,

  documentation: 'Creates badges with rounded/squared sides based on display context',

  methods: [
    function initE(data) {
      this.SUPER();
      this
        .addClass(this.myClass())
        .style({
          'background-color': this.data.background,
          'color': this.data.color,
          'border': this.data.background == '#FFFFFF' ? '1px solid' : 'none'
        })
        .start()
          .addClass(this.myClass('label'))
          .add(this.data.label)
        .end();
    }
  ]
});
