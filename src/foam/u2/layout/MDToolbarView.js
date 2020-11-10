/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.u2.layout',
  name: 'MDToolbarView',
  extends: 'foam.u2.Element',

  requires: [
    'foam.u2.ActionView'
  ],

  properties: [
    'title', 'leftAction', 'rightAction'
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
      this
        .start('toolbar')
          .start('div').add(this.leftAction$).addClass('left').end()
          .start('div').show(this.title$).tag(this.title$).addClass('title').end()
          .start('div').add(this.rightAction$).addClass('right').end()
        .end();
    }
  ],

  css: `
    ^ {
      top: 0;
      height: 10em;
      width: 100%;
      z-index: 10;
    }

    ^ toolbar {
      display: flex;
      align-items: center;
      height: 100%;
      justify-content: space-between;
      background-color: /*%PRIMARY1%*/ #2e2379;
      box-shadow: 0px 0px 50px 0px /*%PRIMARY1%*/ #2e2379;
      color: /*%GREY4%*/ #e7eaec;
    }
  `,
});
