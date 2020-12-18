/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'DashboardCitationView',
  extends: 'foam.u2.View',

  axioms: [
    foam.pattern.Faceted.create()
  ],

  exports: [
    'as rowView'
  ],

  properties: [
    {
      class: 'Class',
      name: 'of'
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start()
          .addClass('id')
          .add(this.data['id'])
        .end()
        .start()
          .addClass('value')
          .add(this.data['value'])
        .end()
    }
  ],

  css: `
    ^ {
      display: flex;
      justify-content: space-between;
      padding-top: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e4e3e3;
    }

    ^ .id {
      font-weight: 300;
      font-size: 17px;
      color: gray;
    }

    ^ .value {
      font-size: 13px;
    }
  `
});
