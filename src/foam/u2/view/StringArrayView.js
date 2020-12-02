/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'StringArrayView',
  extends: 'foam.u2.view.ArrayView',

  properties: [
    {
      name: 'valueView',
      value: { class: 'foam.u2.TextField' }
    }
  ]
});
