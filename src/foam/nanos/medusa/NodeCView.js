/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'NodeCView',
  extends: 'foam.physics.PhysicalCircle',

  implements: [ 'foam.mlang.Expressions' ],

  imports: [
    'DAO clusterTopologyDAO as dao',
    'zoneRingWidth'
  ],

  requires: [
    'foam.core.Duration',
    'foam.graphics.Arc',
    'foam.graphics.Circle',
    'foam.graphics.Label',
    'foam.graphics.Point',
    'foam.nanos.medusa.ClusterConfig',
    'foam.nanos.medusa.MedusaType',
    'foam.nanos.medusa.Status',
    'foam.nanos.medusa.ElectoralServiceState',
    'foam.nanos.medusa.ReplayingInfoCView',
    'foam.u2.PopupView'
  ],

  properties: [
    {
      name: 'nodeScale',
      class: 'Float',
      value: 0.6
    },
    {
      name: 'mediatorScale',
      class: 'Float',
      value: 0.8
    },
    {
      name: 'config',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.ClusterConfig'
    },
    {
      name: 'width',
      expression: function(zoneRingWidth) {
        var w = this.zoneRingWidth * 0.9;
        if ( this.config.type == this.MedusaType.MEDIATOR ) {
          w *= this.mediatorScale;
        } else {
          w *= this.nodeScale;
        }
        return w;
      }
    },
    {
      name: 'height',
      expression: function(width) {
        return width;
      }
    },
    {
      name: 'radius',
      expression: function(width) {
        return width / 2;
      }
    }
  ],

  methods: [
    async function initCView() {
      this.SUPER();

      this.arcWidth = 3;
      this.color = 'white';

      var label = this.Label.create({
        text: this.config.name,
        align: 'center',
        y: -5 // half font height
      });
      this.add(label);

      if ( this.config.type == this.MedusaType.MEDIATOR ||
           this.config.type == this.MedusaType.NERF ) {
        var replay = this.ReplayingInfoCView.create({
          config: this.config,
          radius: this.radius - this.arcWidth
          // radius$: this.radius$.map(function(r) {
          //   return r - this.arcWidth;
          // }),
        });
        this.add(replay);
      }
      this.refresh();
    },
    {
      name: 'refresh',
      code: async function(self = this) {
        // console.log('NodeCView.refresh');
        if ( self.config ) {
          self.config = await self.dao.find(self.config.id);
          self.updateStatus();
          self.updatePrimary();
          for ( var i = 0; i < self.children.length; i++ ) {
            let child = self.children[i];
            child.refresh && child.refresh(child);
          }
        }
      }
    },
    {
      name: 'updateStatus',
      code: function() {
        if ( this.config.status == this.Status.OFFLINE ) {
          if ( this.config.errorMessage ) {
            this.border = 'red';
          } else {
            this.border = 'orange';
          }
        } else if ( this.config.status == this.Status.ONLINE ) {
          this.border = 'green';
        }
      }
    },
    {
      name: 'updatePrimary',
      code: function() {
        if ( this.config.type == this.MedusaType.MEDIATOR ) {
          if ( this.config.isPrimary ) {
            this.arcWidth = 6;
          } else {
            this.arcWidth = 3;
          }
        }
      }
    }
  ]
});
