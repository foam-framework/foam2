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
    'stack',
    'closeDialog'
  ],

  properties: [
    'title'
  ],

  css: `
    ^ {
      height: 40.8px;
      width: 448px;
      background-color: /*%PRIMARY1%*/ #202341;
      border-radius: 2px 2px 0 0;
      margin: auto;
    }
    ^ .title{
      height: 40px;
      font-family: Roboto;
      font-size: 14px;
      line-height: 2.86;
      text-align: left;
      color: #ffffff;
      margin-left: 25px;
      display: inline-block;
    }
    ^ .close{
      background: 0;
      width: 24px;
      height: 24px;
      margin-top: 5px;
      cursor: pointer;
      position: relative;
      top: -3px;
      right: 20px;
      float: right;
    }
    ^ .foam-u2-ActionView-closeModal{
      position: relative;
      right: 0px;
      width: 50px;
      height: 40px;
      background: transparent;
      margin-top: 0;
      top: 0;
      right: 0;
      border: none;
    }
  `,

  methods: [
    function initE() {
    this.SUPER();

    this
      .addClass(this.myClass())
      .start().addClass('title').add(this.title).end()
      .start(this.CLOSE_MODAL).addClass('close').end();
    }
  ],

  actions: [
    {
      name: 'closeModal',
      icon: 'images/ic-cancelwhite.svg',
      label: '',
      code: function(X) {
        X.closeDialog();
      }
    }
  ]
});
