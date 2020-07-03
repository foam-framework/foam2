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
    'foam.core.Duration',
    'foam.graphics.Label',
    'foam.graphics.Box',
    'foam.physics.PhysicsEngine',
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
      value: 700
    },
    {
      name: 'height',
      value: 700
    },
    {
      name: 'color',
      value: '#f3f3f3'
    },
    {
      name: 'realm',
      value: 'nanopay'
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
        this.seconds$ = t.time$.map(function(t) {
          return Math.floor(t / 10000);
        });
        return t;
      }
    }
  ],

  methods: [
    async function initE() {
      this.SUPER();

      this.canvas.children = [];

      let groupBy = await this.dao
          .select(this.GROUP_BY(this.ClusterConfig.REGION));
      for ( let [k, _] of Object.entries(groupBy.groups) ) {
        let cc = this.ClusterConfig.create({
          realm: this.realm,
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
        start(this.SWITCH_TIMER, { label$: this.timer.isStarted$.map(function(on) { return on ? 'STOP' : 'START' }) }).end().
        tag('br').
        start(this.canvas).
        on('click', this.onClick).
        on('contextmenu', this.onRightClick).
        // on('mousemove', this.onMouseMove).
        end().
        end();

      this.timer.start();
//      this.switchTimer.bind(this);
    },
    {
      name: 'refresh',
      code: function() {
        // console.log('ClusterToplogyView.refresh');
        for ( var i = 0; i < this.canvas.children.length; i++ ) {
          let child = this.canvas.children[i];
          child.refresh && child.refresh(child);
        }
      }
    }
  ],

  actions: [
    {
      name: 'switchTimer',
      label: 'Switch',
      code: function(data, x, self) {
        console.log('timer: click');
        if ( this.timer ) {
          if ( this.timer.isStarted ) {
            this.timer.stop;
            console.log('timer: stopped');
          } else {
            this.timer.start;
            console.log('timer: started');
          }
        }
      }
    }
  ],

  listeners: [
    function onMouseMove(evt) {
      var x = evt.offsetX, y = evt.offsetY;
      console.log('onMouseMove '+x+' '+y);

      var c = this.canvas.findFirstChildAt(x, y);

      if ( c && c !== this.canvas ) {
        c.handleMouseMove && c.handleMouseMove(evt, this);
      }
    },

    function onClick(evt) {
      var x = evt.offsetX, y = evt.offsetY;
      console.log('onClick '+x+' '+y);

      var c = this.canvas.findFirstChildAt(x, y);

      if ( c && c !== this.canvas ) {
        c.handleClick && c.handleClick(evt, this);
      }
    },

    function onRightClick(evt) {
      evt.preventDefault();
      var x = evt.offsetX, y = evt.offsetY;

      console.log('onRightClick '+x+' '+y);

      var c = this.canvas.findFirstChildAt(x, y);

      if ( c && c !== this.canvas ) {
        c.handleRightClick && c.handleRightClick(evt, this);
      }
    }
  ]
});
