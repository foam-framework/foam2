/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'RegionCView',
  extends: 'foam.graphics.CView',

  implements: [ 'foam.mlang.Expressions' ],

  imports: [
    'DAO clusterTopologyDAO as dao',
    'minZoneRingWidth'
  ],

  exports: [
    'zoneRingWidth'
  ],

  requires: [
    'foam.graphics.Label',
    'foam.nanos.medusa.ClusterConfig',
    'foam.nanos.medusa.ZoneCView',
  ],

  properties: [
    {
      name: 'zoneRingWidth',
      class: 'Long'
    },
    {
      name: 'config',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.ClusterConfig'
    }
  ],

  methods: [
    async function initCView() {
      this.SUPER();

      var label = this.Label.create({
        text: 'Realm' + ' ' + this.config.realm,
        align: 'left',
        y: 10,
        x: 10
      });
      this.add(label);
      var label = this.Label.create({
        text: 'Region' + ' ' + this.config.region,
        align: 'left',
        y: 20,
        x: 10
      });
      this.add(label);

      // TODO: absolutely no idea how to properly setup GroupBy with max.
      // var count = this.COUNT();
      // var max = this.MAX(this.ClusterConfig.ZONE);
      // var s = await this.dao
      //     .where(
      //       this.AND(
      //         this.EQ(this.ClusterConfig.REALM, this.config.realm),
      //         this.EQ(this.ClusterConfig.REGION, this.config.region)
      //       )
      //     )
      //     .select(
      //     .pipe(
      //       this.GROUP_BY(this.ClusterConfig.ZONE, this.SEQ(count, max))
      //     );

      // var zones = count.value;

      // TODO: another attempt, not working
      var max = this.MAX(this.ClusterConfig.ZONE);
      var groupBy = await this.dao
          .where(
            this.AND(
              this.EQ(this.ClusterConfig.REALM, this.config.realm),
              this.EQ(this.ClusterConfig.REGION, this.config.region)
            )
          )
          .select(
            this.GROUP_BY(this.ClusterConfig.ZONE, max)
          );
      var zones = Math.max(1, Object.entries(groupBy.groups).length);
      // TODO: brute force determine max zone.
      var m = 0;
      for ( const c of Object.entries(groupBy.groups) ) {
        let i = parseInt(c[0]);
        if ( i > m ) {
          m = i;
        }
      }

      this.zoneRingWidth$ = this.width$.map(function(w) {
        return Math.min(w / (zones * 2), this.minZoneRingWidth);
      }.bind(this));

      let sink = await this.dao
          .where(
            this.AND(
              this.EQ(this.ClusterConfig.REALM, this.config.realm),
              this.EQ(this.ClusterConfig.REGION, this.config.region),
              this.EQ(this.ClusterConfig.ZONE, m)
            )
          )
          .limit(1)
          .select();
      let diameter = Math.min(this.height, this.width);
      // only one zone, use the zone 1 size
      var radius = diameter;
      if ( m == 0 ) {
        radius = radius - (this.zoneRingWidth * 2);
      }
      sink.array.forEach(function(cc) {
        let zone = this.ZoneCView.create({
          config: cc,
          height: this.height,
          width: this.width,
          radius: radius / 2,
          x: diameter / 2,
          y: diameter / 2
        });
        this.add(zone);
      }.bind(this));
    },
    {
      name: 'refresh',
      code: async function(self = this) {
        console.log('RegionCView.refresh '+self.children.length);
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
  ]
});
