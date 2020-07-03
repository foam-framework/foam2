/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'RegionCView',
  extends: 'foam.graphics.CView',

  properties: [
    {
      name: 'config',
      class: 'FObject',
      of: 'foam.nanos.medusa.ClusterConfig'
    }
  ]
});
