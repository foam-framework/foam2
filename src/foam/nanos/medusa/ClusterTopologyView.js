/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterTopologyView',
  extends: 'foam.u2.Element',

  documentation: ``,

  implements: [ 'foam.mlang.Expressions' ],

  requires: [
    'foam.graphics.Label',
    'foam.graphics.Box',
    'foam.nanos.medusa.ClusterConfig',
    'foam.nanos.medusa.RegionCView',
    'foam.util.Timer',
  ],

  imports: [
    'DAO clusterTopologyDAO as dao',
  ],

  exports: [
    'minZoneRingWidth'
  ],

  properties: [
    {
      name: 'minZoneRingWidth',
      class: 'Long',
      value: 125
    },
    {
      name: 'width',
      value: 1000
    },
    {
      name: 'height',
      value: 1000
    },
    {
      name: 'color',
      value: '#f3f3f3'
    },
    {
      documentation: 'seconds between refreshes.',
      name: 'refreshRate',
      value: 10
    },
    {
      name: 'canvas',
      factory: function() {
        return this.Box.create({
          width: this.width,
          height: this.height,
//          color: this.color
        });
      }
    },
    {
      class: 'Int',
      name: 'seconds',
      postSet: function() {
        this.refresh();
      },
      hidden: true,
    },
    {
      class: 'FObjectProperty',
      of: 'foam.util.Timer',
      name: 'timer',
      hidden: true,
      factory: function() {
        var t = this.Timer.create();
        this.seconds$ = t.second$.map(function(s) {
          return Math.floor(s / this.refreshRate);
        }.bind(this));
        return t;
      }
    }
  ],

  methods: [
    async function initE() {
      this.SUPER();

      this.canvas.children = [];

      // TODO: presently only support one realm
      let sink = await this.dao.limit(1).select();
      let config = sink.array[0];
      let groupBy = await this.dao
          .select(this.GROUP_BY(this.ClusterConfig.REGION));
      for ( let [k, _] of Object.entries(groupBy.groups) ) {
        let cc = this.ClusterConfig.create({
          realm: config.realm,
          region: k
        });
        let region = this.RegionCView.create({
          config: cc,
          width: this.width,
          height: this.height
        });
        this.canvas.add(region);
      }

      this.
        addClass(this.myClass()).
        start('center').
        add('Cluster Topology').
        tag('br').
        start(this.canvas).
        on('click', this.onClick).
        on('contextmenu', this.onRightClick).
        // on('mousemove', this.onMouseMove).
        end().
        end();

      this.timer.start();
      this.canvas.canvas.onDetach(this.stopTimer);
    },
    {
      name: 'refresh',
      code: function() {
        console.log('ClusterToplogyView.refresh '+this.canvas.children.length);
        for ( var i = 0; i < this.canvas.children.length; i++ ) {
          let child = this.canvas.children[i];
          child.refresh && child.refresh(child);
        }
        this.canvas.invalidate();
      }
    }
  ],

  listeners: [
    function onMouseMove(evt) {
      let x = evt.offsetX;
      let y = evt.offsetY;
      console.log('onMouseMove '+x+' '+y);

      var c = this.canvas.findFirstChildAt(x, y);

      if ( c && c !== this.canvas ) {
        c.handleMouseMove && c.handleMouseMove(evt, this);
      }
    },

    function onClick(evt) {
      let x = evt.offsetX;
      let y = evt.offsetY;
      console.log('onClick '+x+' '+y);

      var c = this.canvas.findFirstChildAt(x, y);

      if ( c && c !== this.canvas ) {
        c.handleClick && c.handleClick(evt, this);
      }
    },

    function onRightClick(evt) {
      evt.preventDefault();
      let x = evt.offsetX;
      let y = evt.offsetY;

      console.log('onRightClick '+x+' '+y);

      var c = this.canvas.findFirstChildAt(x, y);

      if ( c && c !== this.canvas ) {
        c.handleRightClick && c.handleRightClick(evt, this);
      }
    },

    function stopTimer() {
      console.log('stopTimer');
      this.timer.stop();
    }
  ]
});
