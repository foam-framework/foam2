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
    },
    {
      name: 'openTime',
      class: 'Long'
    },
    {
      name: 'openIndex',
      class: 'Long'
    }
  ],

  methods: [
    function initCView() {
      this.SUPER();

      this.borderWidth = 5;
      this.border = 'blue';
      this.color = 'white';

      this.openTime = Date.now();
      this.openIndex = this.config.replayingInfo.index;

//       var view = foam.graphics.ViewCView.create({
// //        innerView: this.config.replayingInfo.toE(null, this)
//         innerView: foam.u2.DetailView.create({
//           data: this.config.replayingInfo
//         })
//       });
//       this.add(view);
//       return;

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

      if ( this.config.replayingInfo.replaying ) {
        label = this.makeLabel();
        label.text$ = this.config$.map(function(c) { return 'Replay: '+c.replayingInfo.replayIndex; });
        this.add(label);

        label = this.makeLabel();
        label.text$ = this.config$.map(function(c) {
          let end = c.replayingInfo.endTime || new Date();
          let delta = end.getTime() - c.replayingInfo.startTime.getTime();
          let duration = foam.core.Duration.duration(delta);
          return 'Elapsed: '+duration;
        });
        this.add(label);

        label = this.makeLabel();
        label.text$ = this.config$.map(function(c) { let f = (c.replayingInfo.percentComplete * 100).toFixed(2); return 'Complete: '+f+'%'; });
        this.add(label);

        label = this.makeLabel();
        label.text$ = this.config$.map(function(c) { return 'Remaining: '+c.replayingInfo.timeRemaining; });
        this.add(label);

        label = this.makeLabel();
        label.text$ = this.config$.map(function(c) { return 'Replay TPS: '+c.replayingInfo.replayTps; });
        this.add(label);
      }

      label = this.makeLabel();
      label.text$ = this.config$.map(function(c) {
        let now = Date.now();
        let idle = now - (c.replayingInfo.lastModified && c.replayingInfo.lastModified.getTime() || now);
        let tm = (now - this.openTime - idle) / 1000;
        let diff = c.replayingInfo.index - this.openIndex;
        if ( diff > 0 ) {
          return 'TPS: '+ (diff / tm).toFixed(0);
        }
        return 'TPS: N/A';
      }.bind(this));
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config$.map(function(c) {
        let now = Date.now();
        let delta = now - (c.replayingInfo.lastModified && c.replayingInfo.lastModified.getTime() || now);
        let duration = foam.core.Duration.duration(delta);
        return 'Idle: '+duration;
      });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config$.map(function(c) {
        var used = 0;
        if ( c.memoryMax > 0 ) {
          used = ((c.memoryMax - c.memoryFree) / c.memoryMax) * 100;
        }
        if ( used < 70 ) {
          label.color = 'green';
        } else if ( used < 80 ) {
          label.color = 'orange';
        } else {
          label.color = 'red';
        }
        let max = c.memoryMax / (1024*1024*1024);
        return 'Memory: '+used.toFixed(0)+'% '+max.toFixed(1)+'gb';
      });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config$.map(function(c) {
        if ( c.errorMessage && c.errorMessage.length > 0 ) {
          return 'Error: '+c.errorMessage;
        } else {
          return '';
        }
      });
      label.color = 'red';
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config$.map(function(c) {
        if ( c.alarms && c.alarms > 0 ) {
          return 'Alarms: '+c.alarms;
        } else {
          return '';
        }
      });
      label.color = 'red';
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
        element.canvas.remove(this);
      }
    }
  ]
});
