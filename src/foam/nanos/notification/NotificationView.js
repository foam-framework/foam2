/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'NotificationView',
  extends: 'foam.u2.View',
  axioms: [ foam.pattern.Faceted.create() ],

  properties: [ 'of' ],
  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start('div').on('click', this.onClick).addClass('msg').add(this.data.body).end();
    }
  ],
  listeners: [
    function onClick () {
      if ( this.childNodes[0].css.display == "block" ) {
        this.childNodes[0].style({display:'-webkit-box'})
      }
      else
        this.childNodes[0].style({display:'block'})
    }
  ]
});
