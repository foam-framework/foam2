/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'BadgeView',
  extends: 'foam.u2.View',

  css: `
    ^{
      border-radius: 11.2px
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 10px;
      font-style: normal;
      font-stretch: normal;
      font-weight: 500;
      height: 24px;
      line-height: 24px;
      letter-spacing: normal;
      padding: 0 8px;
      text-align: center;
      width: 79px;
    }
   
  `,

  documentation: `Creates badges with rounded/squared sides based on display context`,

  properties: [
    {
        class: 'String',
        name: 'label'
    },
    {
        class: 'String',
        name: 'backgroundColor'
    },
    {
        class: 'String',
        name: 'color'
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .style({
          'background-color': this.backgroundColor,
          'color': this.color
        })
        .start()
          .addClass(this.myClass('label'))
          .add(this.label)
        .end();
    }
  ]
});
