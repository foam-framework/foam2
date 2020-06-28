/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterTopologyView',
  extends: 'foam.graphics.CView',

  documentation: ``,

  requires: [
    'foam.core.Duration',
    'foam.graphics.Arc',
    'foam.graphics.Box',
    'foam.graphics.Circle',
    'foam.graphics.CView',
    'foam.graphics.Label',
    'foam.graphics.Point',
    'foam.physics.PhysicalCircle',
    'foam.physics.PhysicsEngine',
    'foam.nanos.medusa.ClusterConfig',
    'foam.nanos.medusa.MedusaType',
    'foam.nanos.medusa.Status',
    'foam.nanos.medusa.ElectoralServiceState',
    'foam.util.Timer',
  ],

  imports: [
    'DAO clusterTopologyDAO as data',
  ],

  properties: [
    {
      name: 'nodeK',
      value: 25
    },
    {
      name: 'width',
      value: '700'
    },
    {
      name: 'height',
      value: '700'
    },
    {
      name: 'regions',
      class: 'Map',
      factory: function() {
        return new Map();
      }
    },
    {
      name: 'zones',
      class: 'Map',
      factory: function() {
        return new Map();
      }
    },
    {
      name: 'nodes',
      class: 'Map',
      factory: function() {
        return new Map();
      }
    },
    {
      class: 'Int',
      name: 'seconds',
      postSet: function() {
        this.refresh();
        // this.elapsed = this.seconds - this.roundStart;
        // this.remaining = this.roundLength - this.elapsed;
        // if ( this.remaining == 0 ) this.state.next(this);
      }
    },
    {
      name: 'engine',
      factory: function() {
        var e = this.PhysicsEngine.create({gravity: true});
        e.start();
        return this.onDetach(e);
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.util.Timer',
      name: 'timer',
      required: true,
      hidden: true,
      factory: function() {
        var t = this.Timer.create();
        this.seconds$ = t.time$.map(function(t) { return Math.floor(t / 10000); });
        return t;
      }
    }
  ],

  methods: [
    function initCView() {
      this.SUPER();
      // timer to refresh on dao.
      // group by zone, create enclosing circles
      // walk doa, create machines,
      // create circles for mediators
      // create squares for nodes
      // create triangles for others.
      // double circle if voter.
      // set colour on primary - fill
      // set something on status - perhaps size - border colour
      // create lines between
      // adjust distance based on ping
      this.load();
//      this.drawRegion();
      this.timer.start();
    },
    {
      name: 'load',
      code: async function() {
        console.log('load');
        var zoneIndex = new Map();
        var sink = await this.data.select();
        sink.array.forEach(function(cc) {
          index += 1;
          var region = this.regions.get(cc.region);
          if ( ! region ) {
            region = this.makeRegion(cc.region);
            this.regions.set(cc.region, region);
          }

          var zone = this.zones.get(cc.zone);
          if ( ! zone ) {
            zone = this.makeZone(cc.zone);
            this.zones.set(cc.zone, zone);
            this.add(zone);
//            region.add(zone);
          }

          var node = this.nodes.get(cc.id);
          if ( ! node ) {
            node = this.makeNode(cc);
            this.nodes.set(cc.id, node);
            var index = zoneIndex.get(cc.zone);
            if ( ! index ) {
              index = 0;
            }
            index += 1;
            zoneIndex.set(cc.zone, index);
            zone.add(node);
          } else {
            node = node.copyFrom(cc);
          }
        }.bind(this));

        // pass two for sizing
        let ringWidth = this.width / (this.zones.size * 2);
        this.zones.forEach(function(cv, zone, _) {
          cv.radius = (zone + 1) * ringWidth;
          var node = 1;
          this.nodes.forEach( function(cv, id, _) {
            this.data.find(id).then(function(cc) {
              if ( cc.zone == zone ) {
                let inR = zone * ringWidth;
                let p = this.nextOnRing(this.x, this.y, inR, inR+ringWidth, zoneIndex.get(zone), node++);
                cv.x = p.x;
                cv.y = p.y;
                this.refreshNode(cc);
              }
            }.bind(this));
          }.bind(this));
        }.bind(this));
      }
    },
    {
      name: 'refresh',
      code: function() {
        this.nodes.forEach( function(cv, id, _) {
          this.data.find(id).then(function(cc) {
            this.refreshNode(cc);
          }.bind(this));
        }.bind(this));
      }
    },
    {
      name: 'makeRegion',
      code: function(region) {
        var label = this.Label.create({
          text: 'Region '+region,
          align: 'left',
          y: 10,
          x: 10
        });
        this.add(label);
      }
    },
    {
      name: 'makeZone',
      code: function(zone) {
        var circle = this.Circle.create({
          arcWidth: 3.0,
          x: this.width / 2,
          y: this.height / 2
        });
        var label = this.Label.create({
          text: 'Zone '+zone,
          align: 'center',
          y$: circle.radius$.map(function(r) {return r * -1 + 10;})
        });
        circle.add(label);
        return circle;
      }
    },
    {
      name: 'makeNode',
      code: function(cc) {
        var radius = this.nodeK;
        if ( cc.type == this.MedusaType.MEDIATOR ) {
          radius = radius * 1.5;
        }

        var color  = 'blue';
        var circle = this.PhysicalCircle.create({
          radius: radius,
          border: color,
          arcWidth: 3.0,
          gravity: 0,
        });
        var label = this.Label.create({
          text: cc.id,
          align: 'center',
          y: -5 // half font height
        });
        circle.add(label);
        return circle;
      }
    },
    {
      name: 'refreshNode',
      code: function(cc) {
        this.updateType(cc);
        this.updateStatus(cc);
        this.updatePrimary(cc);
        this.updateReplaying(cc);
        this.updateInfo(cc);
      }
    },
    {
      name: 'updateReplaying',
      code: function(cc) {
        var cv = this.nodes.get(cc.id);
        if ( cc.type == this.MedusaType.MEDIATOR ) {
          var replayCircle = cv.replayCircle;
          if ( ! replayCircle ) {
            replayCircle = this.Circle.create({
              radius$: cv.radius$.map(function(r) {return r - cv.arcWidth;}),
              color: '',
              border: '',
              arcWidth: 1,
              alpha: 0.5
            });
            replayCircle.border$ = replayCircle.color$;
            cv.replayCircle = replayCircle;
            cv.add(replayCircle);
          }
          var replayLabel = cv.replayLabel;
          if ( ! replayLabel ) {
            replayLabel = this.Label.create({
              align: 'center',
              y: +5
            });
            cv.replayLabel = replayLabel;
            replayCircle.add(replayLabel);
          }
          var etaLabel = cv.etaLabel;
          if ( ! etaLabel ) {
            etaLabel = this.Label.create({
              align: 'center',
              y: -15
            });
            cv.etaLabel = etaLabel;
            replayCircle.add(etaLabel);
          }
          var statsLabel = cv.statsLabel;
          if ( ! statsLabel ) {
            statsLabel = this.Label.create({
              align: 'center',
              y: -15
            });
            cv.statsLabel = statsLabel;
            //            replayCircle.add(statsLabel);
            cv.findFirstChildAt = function(p) {
              let c = cv.super.findFirstChildAt(p);
              if ( c ) {
                cv.add(cv.statsLabel);
              } else {
                cv.remove(cv.statsLabel);
              }
            };
          }
          if ( cc.replayingInfo ) {
            if ( cc.replayingInfo.replaying &&
                 cc.replayingInfo.replayIndex > 0 )  {
              replayCircle.color = 'grey';
//              p = cc.replayingInfo.index / cc.replayingInfo.replayIndex;
              replayCircle.start = (1 - cc.replayingInfo.percentComplete ) * (2 * Math.PI);
              // p = parseInt(p * 100);
              // replayLabel.text = p+'%';

              // calculate ETA
              // let delta = Date.now() - cc.replayingInfo.startTime.getTime();
              // let rate = cc.replayingInfo.index / delta;
              // let t = rate * (cc.replayingInfo.replayIndex - cc.replayingInfo.index); // ms
              // let eta = this.Duration.create().format(t);
              etaLabel.text = cc.percentComplete;
            } else {
              replayCircle.color = '';
              // let delta = cc.replayingInfo.endTime.getTime() - cc.replayingInfo.startTime.getTime();
              // let eta = this.Duration.create().format(delta);
              etaLabel.text = cc.eta;
            }
            replayLabel.text = cc.replayingInfo.index;
            statsLabel.text = cc.replayingInfo.index + '\n' + cc.replayingInfo.replayIndex;
          }
        }
      }
    },
    {
      name: 'updateType',
      code: function(cc) {
        var cv = this.nodes.get(cc.id);
        if ( cc.type == this.MedusaType.MEDIATOR ) {
          cv.radius = this.nodeK * 1.5;
        } else {
          cv.radius = this.nodeK;
        }
      }
    },
    {
      name: 'updateStatus',
      code: function(cc) {
        var cv = this.nodes.get(cc.id);
        if ( cc.status == this.Status.OFFLINE ) {
          if ( cc.errorMessage ) {
            cv.border = 'red';
          } else {
            cv.border = 'orange';
          }
        } else if ( cc.status == this.Status.ONLINE ) {
          cv.border = 'green';
        }
      }
    },
    {
      name: 'updatePrimary',
      code: function(cc) {
        var cv = this.nodes.get(cc.id);
        if ( cc.type == this.MedusaType.MEDIATOR ) {
          if ( cc.isPrimary ) {
            cv.arcWidth = 6;
          } else {
            cv.arcWidth = 3;
          }
        }
      }
    },
    {
      name: 'updateInfo',
      code: function(cc) {
        var cv = this.nodes.get(cc.id);
        // if ( cc.errorMessage ) {
        //   cv.color = 'yellow';
        //   cv.alhpa = 0.5;
        // } else {
        //   cv.color = '';
        //   cv.alpha = 1;
        // }
      }
    },
    {
      name: 'randomInRing',
      code: function(centerX, centerY, minRadius, maxRadius) {
        var radius = Math.sqrt(
          Math.random() *
            (Math.pow(maxRadius, 2) - Math.pow(minRadius, 2)) +
            Math.pow(minRadius, 2)
        );
        let theta = Math.random() * 2 * Math.PI;
        let x = radius * Math.cos(theta) + centerX;
        let y = radius * Math.sin(theta) + centerY;
        return this.Point.create({x: x, y: y});
      }
    },
    {
      name: 'randomOnRing',
      code: function(centerX, centerY, minRadius, maxRadius) {
        var offset = minRadius == 0 ? minRadius : (maxRadius - minRadius) / 2;
        var radius = Math.sqrt(
          Math.pow(maxRadius, 2) - Math.pow(minRadius, 2) +
            Math.pow(offset, 2)
        );
        let theta = Math.random() * 2 * Math.PI;
        let x = radius * Math.cos(theta) + centerX;
        let y = radius * Math.sin(theta) + centerY;
        return this.Point.create({x: x, y: y});
      }
    },
    {
      name: 'nextOnRing',
      code: function(centerX, centerY, minRadius, maxRadius, size, count) {
        let ringCenterRadius = (maxRadius - minRadius) / 4 * 3 + minRadius;
        let radius = Math.sqrt(
          Math.pow(ringCenterRadius, 2) - Math.pow(minRadius, 2)
            + Math.pow(minRadius, 2)
        );
        let next = count / size;
        let theta = next * 2 * Math.PI;
        let x = radius * Math.cos(theta) + centerX;
        let y = radius * Math.sin(theta) + centerY;
        return this.Point.create({x: x, y: y});
      }
    },
    {
      name: 'isPointInCircle',
      code: function(centerX, centerY, radius, x, y) {
        let d = Math.sqrt(Math.pow(centerX- x, 2) + Math.pow(centerY - y, 2));
        return d <= radius;
      }
    }
  ]
});
