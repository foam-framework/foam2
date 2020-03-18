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
      display: flex;
      flex-direction: row;
      align-items: center;

      width: 100%; /* This is to fit the width of its parent container */
      height: 40px;

      background-color: /*%PRIMARY1%*/ #202341;
    }
    ^title{
      font-family: Roboto;
      font-size: 14px;
      color: #ffffff;
      margin: 0;
      margin-left: 16px;

      flex: 1;
    }
    ^close{
      background: 0;
      width: 24px;
      height: 24px;
      padding: 0 !important;
      cursor: pointer;
      margin: 0 8px;
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
      .start().addClass(this.myClass('title')).add(this.title).end()
      .start(this.CLOSE_MODAL).addClass(this.myClass('close')).end();
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
