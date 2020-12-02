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
      width: 100%;
      line-height: 17px;
    }
    ^ .created {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 11px;
      color: #5e6061;
      margin-left: 16px;
    }
    ^ .description {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      color: #1e1f21;
      white-space: nowrap;
      text-overflow:ellipsis;
      width: 90%;
      overflow: hidden;
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
      this.description = this.data.body;

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
