/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ZoneCView',
  extends: 'foam.graphics.Circle',

  implements: [ 'foam.mlang.Expressions' ],

  imports: [
    'DAO clusterTopologyDAO as dao',
    'zoneRingWidth',
  ],

  requires: [
    'foam.graphics.Label',
    'foam.graphics.Point',
    'foam.nanos.medusa.ClusterConfig',
    'foam.nanos.medusa.NodeCView',
    'foam.nanos.medusa.ZoneCView',
  ],

  properties: [
    {
      name: 'config',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.ClusterConfig'
    }
  ],

  methods: [
    async function initCView() {
      this.SUPER();

      this.arcWidth = 3;
      this.color = this.config.zone % 2 == 0 ? 'white' : 'ivory';
      let label = this.Label.create({
        text: 'Zone '+this.config.zone,
        align: 'center',
        y$: this.radius$.map(function(r) {return r * -1 + 10;})
      });
      this.add(label);

      if ( this.config.zone > 0 ) {
        var sink = await this.dao
            .where(
              this.AND(
                this.EQ(this.ClusterConfig.REALM, this.config.realm),
                this.EQ(this.ClusterConfig.REGION, this.config.region),
                this.EQ(this.ClusterConfig.ZONE, this.config.zone - 1)
              )
            )
            .limit(1)
            .select();
        let ringWidth = 2 * this.zoneRingWidth;
        let diameter = Math.min(this.height, this.width) - ringWidth;
        sink.array.forEach(function(cc) {
          var zone = this.ZoneCView.create({
            config: cc,
            height: this.height - ringWidth,
            width: this.width - ringWidth,
            radius: diameter / 2,
            x: 0,
            y: 0
          });
          this.add(zone);
        }.bind(this));
      }

      var sink = await this.dao
          .where(
            this.AND(
              this.EQ(this.ClusterConfig.REALM, this.config.realm),
              this.EQ(this.ClusterConfig.REGION, this.config.region),
              this.EQ(this.ClusterConfig.ZONE, this.config.zone)
            )
          )
          .select();
      var count = 0;
      var size = sink.array.length;
      sink.array.forEach(function(cc) {
        var node = this.NodeCView.create({
          config: cc
        });

        let p = this.nextOnRing(this.radius, this.zoneRingWidth, size, count++);
        node.x = p.x;
        node.y = p.y;

        this.add(node);
      }.bind(this));
    },
    {
      name: 'refresh',
      code: async function(self = this) {
        console.log('ZoneCView.refresh '+self.children.length);
        if ( self.config ) {
          self.config = await self.dao.find(self.config.id);
          for ( var i = 0; i < self.children.length; i++ ) {
            let child = self.children[i];
            child.refresh && child.refresh(child);
          }
          self.invalidate();
        }
      }
    },
    {
      name: 'nextOnRing',
      code: function(ringRadius, ringWidth, size, count) {
        let radius = ringRadius - ringWidth / 2;
        let next = count / size;
        let theta = next * 2 * Math.PI;
        let x = radius * Math.cos(theta);
        let y = radius * Math.sin(theta);
        return this.Point.create({ x: x, y: y });
      }
    }
  ]
});
