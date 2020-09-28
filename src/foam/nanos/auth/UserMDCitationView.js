/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'UserMDCitationView',
  extends: 'foam.u2.View',

  documentation: 'A single row in a list of users.',

  requires: [
    'foam.u2.layout.MDProfileImageView'
  ],

  css: `
    ^ {
      display: flex;
    }

    ^ .name {
//      font-size: 3rem;
      font-weight: 500;
    }
    ^ .img-container img {
      height: 7rem;
    }

    ^ .info-container {
      padding-left: 3rem;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'data',
      documentation: 'Set this to the user you want to display in this row.'
    }
  ],

  methods: [
    function initE() {
    this.SUPER();
      this
        .addClass(this.myClass())
        this.add(this.MDProfileImageView.create({ src: this.data.profilePicture || 'images/ic-placeholder.png' }))
        .start().addClass('info-container')
          .start()
            .addClass('name')
            .add(this.data.legalName)
          .end()
          .start()
            .addClass('org')
            .add(this.data.email)
          .end()
        .end();
    }
  ]
});
