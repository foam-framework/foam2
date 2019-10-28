/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ReadColorView',
  extends: 'foam.u2.View',

  documentation: 'A view to read a colour property.',

  css: `
    ^ {
      height: /*%INPUTHEIGHT%*/ 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 3px;
    }

    ^black {
      color: /*%BLACK%*/ #1e1f21;
    }

    ^white {
      color: #fff;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .style({ 'background-color': this.data$ })
        .start()
          .addClass(this.myClass('black'))
          .add(this.data$)
        .end()
        .nbsp()
        .start()
          .addClass(this.myClass('white'))
          .add(this.data$)
        .end();
    }
  ]
});
