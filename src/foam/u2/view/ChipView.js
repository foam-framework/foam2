/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ChipView',
  extends: 'foam.u2.View',

  documentation: 'View to display tags with labels',

  imports: [
    'removeChip'
  ],

  css: `
    ^ {
      height: 30px;
      border-radius: 100px;
      background-color: #a4b3b8;
      margin: auto;
      position: relative;
      float: left;
      margin: 5px;
    }

    ^ .label {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2px;
      text-align: left;
      color: #ffffff;
      padding: 8px 15px 6px 10px;
      display: table-cell;
    }

    ^ .foam-u2-ActionView-removeSelf {
      width: 10px;
      height: 10px;
      object-fit: contain;
      margin: 0;
      margin-top: -11;
      float: right;
      cursor: pointer;
      display: inline-block;
      outline: 0;
      border: none;
      background: transparent;
      padding-right: 15x;
    }

    ^ .foam-u2-ActionView-removeSelf img {
      width: 15px;
      height: 15px;
    }

    ^ .foam-u2-ActionView-removeSelf:hover {
      background: transparent;
      background-color: transparent;
    }
  `,

  methods: [
    function initE(){
      this.SUPER();

      this
        .addClass(this.myClass())
        .start()
          .start('p')
            .addClass('label')
            .add(this.data)
            .startContext({ data: this })
              .add(this.REMOVE_SELF)
            .endContext()
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'removeSelf',
      icon: 'images/ic-cancelwhite.svg',
      code: function() {
        this.removeChip(this.data);
      }
    }
  ]
});
