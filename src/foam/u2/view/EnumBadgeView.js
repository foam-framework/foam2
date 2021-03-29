/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'EnumBadgeView',
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
      max-width: 79px;
      padding: 0 8px;
      text-align: center;
    }
  `,

  documentation: 'Creates badges with rounded/squared sides based on display context',

  methods: [
    function initE(data) {
      this
        .addClass(this.myClass())
        .style({
          'background-color': this.data.background,
          'color': this.data.color
        })
        .start()
          .addClass(this.myClass('label'))
          .add(this.data.label)
        .end();
    }
  ]
});
