/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterConfigCView',
  extends: 'foam.graphics.CView',

  implements: [ 'foam.mlang.Expressions' ],

  imports: [
    'DAO clusterTopologyDAO as dao',
  ]
});
