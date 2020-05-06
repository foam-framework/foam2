/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'PreView',
  extends: 'foam.u2.view.ValueView',

  documentation: 'Puts the data in a <pre> tag.',

  properties: [
    [ 'nodeName', 'pre' ]
  ],
});
