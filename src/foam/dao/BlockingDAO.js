/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'BlockingDAO',
  extends: 'foam.dao.AbstractDAO',
  properties: [
    {
      class: 'foam.native.Blocking',
      name: 'blocking',
      of: 'foam.dao.DAO'
    }
  ]
});