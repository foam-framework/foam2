/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.u2.property',
  name: 'MDCheckBox',
  extends: 'foam.u2.property.AbstractCheckBox',

  css: `
    ^ {
      -webkit-appearance: none;
      border: solid 2px #5a5a5a;
      float: right;
      width: 3rem;
      height: 3rem;
      transition: background-color 140ms, border-color 140ms;
    }
    ^:checked {
      background-color: /*%BLACK%*/ #1e1f21;
    }
    ^ .label {
      // WHY DOESN"T WORK?
      font-size: larger;
      font-weight: 500;
      color: red;
    }
 `,

   methods: [
    function initE() {
    this.SUPER();
      this.setAttribute('type', 'checkbox');
      this.addClass(this.myClass())
        .on('click', function() {
           if ( this.getAttribute('disabled') ) return;
           this.data = ! this.data;
         }.bind(this));

      this.start()
        .addClass('label')
        .add(this.label$)
      .end();
    },
  ]
});
