/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ReplayingInfoDetailCView',
  extends: 'foam.graphics.Box',

  implements: [ 'foam.mlang.Expressions' ],

  imports: [
    'DAO clusterTopologyDAO as dao'
  ],

  requires: [
    'foam.graphics.Label',
    'foam.graphics.Circle',
  ],

  properties: [
    {
      name: 'config',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.ClusterConfig'
    },
    {
      name: 'width',
      value: 200
    },
    {
      name: 'height',
      value: 200
    },
    {
      name: 'fontSize',
      value: 15
    },
    {
      name: 'labelOffset',
      value: 15
    }
  ],

  methods: [
    function initCView() {
      this.SUPER();

      this.borderWidth = 3;
      this.border = 'gray';
      this.color = 'white';

      var label = this.makeLabel();
      label.text = this.config.name;
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config$.map(function(c) {
        let delta = new Date().getTime() - c.replayingInfo.startTime.getTime();
        let duration = foam.core.Duration.duration(delta);
        return 'Uptime: '+duration;
      });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config$.map(function(c) { return 'Index: '+c.replayingInfo.index; });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config$.map(function(c) { return 'Replay: '+c.replayingInfo.replayIndex; });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config$.map(function(c) {
        let end = c.replayingInfo.endTime || new Date();
        let delta = end.getTime() - c.replayingInfo.startTime.getTime();
//        let duration = foam.core.Duration.create({value: delta}).formatted();
        let duration = foam.core.Duration.duration(delta);
        return 'Elapsed: '+duration;
      });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config$.map(function(c) { let f = (c.replayingInfo.percentComplete * 100).toFixed(2); return '%: '+f; });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config$.map(function(c) { return 'Remaining: '+c.replayingInfo.timeRemaining; });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config$.map(function(c) { return 'Replay TPS: '+c.replayingInfo.replayTps; });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config$.map(function(c) { return 'TPS: '+c.replayingInfo.tps; });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config$.map(function(c) { return 'Last Error: '+c.errorMessage; });
      this.add(label);
    },
    {
      name: 'refresh',
      code: async function(self = this) {
        console.log('ReplayingInfoDetailCView.refresh '+self.children.length);
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
      name: 'makeLabel',
      code: function() {
        return this.Label.create({
          align: 'center',
          x: this.width / 2,
          y: (this.children || []).length * this.labelOffset
        });
      }
    },
    {
      name: 'handleClick',
      code: function(evt, element) {
        console.log('ReplayingInfoDetailCView.handleClick');
        //this.parent.remove(this);
        element.canvas.remove(this);
      }
    }
  ]
});
