/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'ModalHeader',
  extends: 'foam.u2.View',

  documentation: 'Modal Container close/title use in modal class to append title & close buttons.',

  imports: [
    'stack'
  ],

  properties: [
    'title'
  ],

  css: `
    ^ {
      display: flex;
      flex-direction: row;
      align-items: center;

      width: 100%; /* This is to fit the width of its parent container */
      padding: 24px 24px 20px;
      box-sizing: border-box;
      border-bottom: solid 1px #CBCFD4;
    }
    ^title{
      font-family: /*%FONT1%*/ 'IBM Plex Sans';
      font-style: normal;
      font-weight: 600;
      font-size: 24px;
      line-height: 28px;
      color: #000000;
      margin: 0;
      flex: none;
    }
    ^ .foam-u2-ActionView-closeModal{
      background: transparent !important;
      margin-top: 0;
      border: none !important;
    }
  `,

  methods: [
    function initE() {
    this.SUPER();

    this
      .addClass(this.myClass())
      .start().addClass(this.myClass('title')).add(this.title).end();
    }
  ]
});
