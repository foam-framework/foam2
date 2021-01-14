/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterTopology',
  extends: 'foam.u2.Controller',

  documentation: `Controller for CView of Medusa network topology map.`,

  requires: [
    'foam.nanos.medusa.ClusterTopologyView'
  ],

  properties: [
    {
      name: 'title',
      class: 'String',
      value: 'Cluster Topology',
      visibility: 'HIDDEN'
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start('p').addClass(this.myClass('title')).add(this.TITLE).end()
        .start()
        .add(this.ClusterTopologyView.create())
        .end();
    }
  ],
});
