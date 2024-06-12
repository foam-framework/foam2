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
      align-items: center;
      border-radius: 3px;
      display: flex;
      height: /*%INPUTHEIGHT%*/ 34px;
      justify-content: center;
      padding: 0 32px;
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
        .nbsp()
        .start()
          .addClass(this.myClass('white'))
          .add(this.data$)
        .end();
    }
  ]
});
