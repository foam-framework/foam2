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
      this.openTime = Date.now();
      this.openIndex = this.config.replayingInfo.index;

      this.borderWidth = 5;
      this.border = 'blue';
      this.color = 'white';

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
        let startTime = c.replayingInfo.startTime && c.replayingInfo.startTime.getTime() || Date.now();
        let duration = foam.core.Duration.duration(Date.now() - startTime);
        return 'Uptime: '+duration;
      });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config$.map(function(c) {
        return 'Index: '+c.replayingInfo.index;
      });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config$.map(function(c) {
        return 'Replay: '+c.replayingInfo.replayIndex;
      });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config$.map(function(c) {
        let startTime = c.replayingInfo.startTime && c.replayingInfo.startTime.getTime() || Date.now();
        let endTime = c.replayingInfo.endTime && c.replayingInfo.endTime.getTime() || Date.now();
        let duration = foam.core.Duration.duration(endTime - startTime);
        return 'Elapsed: '+duration;
      });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config$.map(function(c) {
        var pc = 1;
        if ( c.replayingInfo.replayIndex > c.replayingInfo.index ) {
          pc = c.replayingInfo.index / c.replayingInfo.replayIndex;
        }
        let f = (pc * 100).toFixed(2); return 'Complete: '+f+'%';
      });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config$.map(function(c) {
        let startTime = c.replayingInfo.startTime && c.replayingInfo.startTime.getTime() || Date.now();
        let endTime = c.replayingInfo.endTime && c.replayingInfo.endTime.getTime() || Date.now();
        let tm = endTime - startTime;
        let tpm = c.replayingInfo.replayIndex / tm;
        let m = (c.replayingInfo.replayIndex - c.replayingInfo.index) / tpm;
        let duration = foam.core.Duration.duration(m);
        return 'Remaining: '+duration;
      });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config$.map(function(c) {
        let startTime = c.replayingInfo.startTime && c.replayingInfo.startTime.getTime() || Date.now();
        let endTime = c.replayingInfo.endTime && c.replayingInfo.endTime.getTime() || Date.now();
        let tm = (endTime - startTime) / 1000;
        return 'Replay TPS: '+(c.replayingInfo.replayIndex / tm);
      });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config$.map(function(c) {
        let endTime = Date.now();
        let tm = (endTime - this.openTime) / 1000;
        return 'TPS: '+(c.replayingInfo.index - this.openIndex) / tm;
      });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config$.map(function(c) {
        return 'Last Modified: '+c.lastModified;
      });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config$.map(function(c) {
        return 'Last Error: '+c.errorMessage;
      });
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
