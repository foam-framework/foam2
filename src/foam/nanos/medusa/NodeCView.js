/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'NodeCView',
  extends: 'foam.graphics.Circle',

  implements: [ 'foam.mlang.Expressions' ],

  imports: [
    'DAO clusterTopologyDAO as dao',
    'zoneRingWidth'
  ],

  requires: [
    'foam.graphics.Arc',
    'foam.graphics.Circle',
    'foam.graphics.Label',
    'foam.graphics.Point',
    'foam.nanos.medusa.AccessMode',
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
        if ( this.config.type == this.MedusaType.MEDIATOR ||
             this.config.type == this.MedusaType.NERF ) {
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

      this.color = 'white';

      this.border = 'green';
      this.border$ = this.config$.map(function(c) {
        if ( c.status == this.Status.OFFLINE ) {
          if ( c.errorMessage ) {
            return 'red';
          } else {
            return 'orange';
          }
        } else if ( c.status == this.Status.ONLINE ) {
          if ( c.type == this.MedusaType.NERF ) {
            return 'purple';
          }
          if ( c.type == this.MedusaType.ARCHIVE ) {
            return 'grey';
          }
          if ( c.type == this.MedusaType.OTHER ) {
            return 'brown';
          }
          if ( c.type == this.MedusaType.NODE ) {
            if ( c.accessMode == this.AccessMode.RO ) {
               this.color = '#F5F5F5';
               return 'gray';
            }
            if ( c.bucket == 1 ) {
              return 'lightblue';
            }
            if ( c.bucket == 3 ) {
              return 'darkblue';
            }
            return 'blue';
          }
          return 'green';
        }
      }.bind(this));

      this.arcWidth = 3;
      this.arcWidth$ = this.config$.map(function(c) {
        if ( c.type == this.MedusaType.MEDIATOR &&
             c.isPrimary ) {
          return 6;
        }
        return 3;
      }.bind(this));

      var label = this.Label.create({
        text: this.config.name,
        align: 'center',
        y: -5 // half font height
      });
      this.add(label);

      if ( this.config.replayingInfo ) {
        var replay = this.ReplayingInfoCView.create({
          config: this.config,
          radius: this.radius - this.arcWidth
        });
        this.add(replay);
      };

      this.refresh();
    },
    {
      name: 'refresh',
      code: async function(self = this) {
        console.log('NodeCView.refresh '+self.children.length);
        if ( self.config ) {
          self.config = await self.dao.find(self.config.id);
          for ( var i = 0; i < self.children.length; i++ ) {
            let child = self.children[i];
            child.refresh && child.refresh(child);
          }
          self.invalidate();
        }
      }
    }
  ]
});
