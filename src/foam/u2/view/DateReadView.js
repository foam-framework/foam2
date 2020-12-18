/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'DateReadView',
  extends: 'foam.u2.View',

  documentation: 'formats date based on locale',

  methods: [
    function initE() {
      this.SUPER();
      if ( ! foam.Date.isInstance(this.data) ) return;

      let stringDate = '';
      try {
        stringDate = new Intl.DateTimeFormat(foam.locale).format(this.data);
      } catch (e) {
        stringDate = new Intl.DateTimeFormat('en-CA').format(this.data);
      }
      return this.add(stringDate);
    }
  ],
});
