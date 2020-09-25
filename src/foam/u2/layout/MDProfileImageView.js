/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.u2.layout',
  name: 'MDProfileImageView',
  extends: 'foam.u2.View',

  properties: [
    'label', 'src'
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start('div').addClass('img-container')
          .start('img')
            .attrs({
              src: this.src
            })
          .end()
        .end()
        .start().addClass('label').show(this.label)
          .add(this.label)
        .end();
    }
  ],

  css: `
    ^ {
      display: flex;
      align-items: center;
    }
    ^ img {
      border-radius: 50%;
    }
  `
});
