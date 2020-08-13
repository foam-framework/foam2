/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'NotificationCitationView',
  extends: 'foam.u2.View',

  axioms: [
    foam.pattern.Faceted.create()
  ],

  css: `
    ^ {
      line-height: 17px;
    }
    ^ .created {
      font-family: /*%FONT1%*/;
      font-size: 11px;
      color: #5e6061;
      margin-left: 16px;
    }
    ^ .description {
      font-family: /*%FONT1%*/;
      font-size: 14px;
      color: #1e1f21;
      margin-left: 32px;
      display: inline-block;
    }
  `,

  properties: [
    'of',
    'created',
    'description'
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.created = this.data.created.toUTCString();

      // truncate string if it is too long
      this.description = this.data.body;
      if ( this.description && this.description != '' && this.description.length > 70 ) {
        this.description = this.description.substr(0, 70-1) + '...';
      }

      this
        .addClass(this.myClass())
        .start()
          .start().addClass('created')
            .add(this.created$)
          .end()
          .start().addClass('description')
            .add(this.description$)
          .end()
        .end();
    }
  ]
});
