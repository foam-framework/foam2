/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'BusinessDirectorArrayView',
  extends: 'foam.u2.view.FObjectArrayView',

  properties: [
    'errors_'
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        this.ADD_ROW.label = '+ Add Director';
      }
    }
  ],
});
