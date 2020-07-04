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

      this.width = 200;
      this.height = 200;
      this.y = -1 * this.height / 2;
      this.borderWidth = 3;
      this.border = 'gray';
      this.color = 'white';

      var label = this.makeLabel();
      label.text = this.config.name;
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config.replayingInfo.uptime$.map(function(u) { return 'Uptime: '+u; });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config.replayingInfo.index$.map(function(u) { return 'Index: '+u; });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config.replayingInfo.replayIndex$.map(function(u) { return 'Replay: '+u; });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config.replayingInfo.timeElapsed$.map(function(u) { return 'Elapsed: '+u; });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config.replayingInfo.percentComplete$.map(function(u) { return '%: '+(u * 100).toFixedTo(2); });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config.replayingInfo.timeRemaining$.map(function(u) { return 'Remaining: '+u; });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config.replayingInfo.replayTps$.map(function(u) { return 'Replay TPS: '+u; });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config.replayingInfo.tps$.map(function(u) { return 'TPS: '+u; });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config.errorMessage$.map(function(u) { return 'Last Error: '+u; });
      this.add(label);
    },
    {
      name: 'refresh',
      code: async function(self = this) {
        // console.log('ReplayingInfoDetailCView.refresh');
        if ( self.config ) {
          self.config = await self.dao.find(self.config.id);
          for ( var i = 0; i < self.children.length; i++ ) {
            let child = self.children[i];
            child.refresh && child.refresh(child);
          }
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
        this.parent.remove(this);
      }
    }
  ]
});
