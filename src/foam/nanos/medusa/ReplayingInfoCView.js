/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ReplayingInfoCView',
  extends: 'foam.graphics.Circle',

  implements: [ 'foam.mlang.Expressions' ],

  imports: [
    'DAO clusterTopologyDAO as dao'
  ],

  requires: [
    'foam.graphics.Arc',
    'foam.graphics.Circle',
    'foam.graphics.Label',
    'foam.graphics.Point',
    'foam.graphics.ScrollCView',
    'foam.nanos.medusa.ClusterConfig',
    'foam.nanos.medusa.MedusaType',
    'foam.nanos.medusa.ReplayingInfoDetailCView',
    'foam.u2.DetailView',
    'foam.u2.PopupView'
  ],

  properties: [
    {
      name: 'config',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.ClusterConfig'
    },
    {
      name: 'complete',
      class: 'String'
    },
    {
      name: 'completeLabel',
      class: 'FObjectProperty',
      of: 'foam.graphics.Label',
      factory: function() {
        return this.Label.create({
          align: 'center',
          y: -25,
          text$: this.config$.map(function(c) {
            if ( c.type == this.MedusaType.MEDIATOR &&
                 c.replayingInfo &&
                 c.replayingInfo.replaying &&
                 c.replayingInfo.replayIndex > 0 ) {
              let complete = c.replayingInfo.percentComplete;
              if ( complete && complete > 0 && complete < 1 ) {
                let f = (complete * 100).toFixed(2);
                return f+'%';
              }
            }
            return '';
          }.bind(this))
        });
      }
    },
    {
      // only applies to mediators
      name: 'etaLabel',
      class: 'FObjectProperty',
      of: 'foam.graphics.Label',
      factory: function() {
        return this.Label.create({
          align: 'center',
          y: -15,
          text$: this.config$.map(function(c) {
            if ( c.type == this.MedusaType.MEDIATOR &&
                 c.replayingInfo &&
                 c.replayingInfo.replaying &&
                 c.replayingInfo.replayIndex > 0 ) {
              return c.replayingInfo.timeRemaining;
            }
            return '';
          }.bind(this))
        });
      }
    },
    {
      name: 'indexLabel',
      class: 'FObjectProperty',
      of: 'foam.graphics.Label',
      factory: function() {
        return this.Label.create({
          align: 'center',
          y: +5,
          text$: this.config$.map(function(c) {
            if ( c.replayingInfo ) {
              var index = Math.max(c.replayingInfo.index, c.replayingInfo.maxIndex);
              if ( index > 0 ) {
                return index;
              }
            }
            return '';
          })
        });
      }
    },
    {
      name: 'replayIndexLabel',
      class: 'FObjectProperty',
      of: 'foam.graphics.Label',
      factory: function() {
        return this.Label.create({
          align: 'center',
          y: +15,
          text$: this.config$.map(function(c) {
            if ( c.type == this.MedusaType.MEDIATOR &&
                 c.replayingInfo &&
                 c.replayingInfo.replaying &&
                 c.replayingInfo.replayIndex > 0 ) {
              return c.replayingInfo.replayIndex;
            }
            return '';
          }.bind(this))
       });
      }
    },
    {
      name: 'infoView',
      class: 'FObjectProperty',
      of: 'foam.graphics.CView'
    }
  ],

  methods: [
    async function initCView() {
      this.SUPER();

      this.border = '';
      this.arcWidth = 1;
      this.alpha = 0.5;

      this.start$ = this.config$.map(function(c) {
        if ( c.replayingInfo &&
             c.replayingInfo.replaying ) {
          return (1 - c.replayingInfo.percentComplete ) * (2 * Math.PI);
        }
        return 0;
      });

      this.color = '';
      this.color$ = this.config$.map(function(c) {
        if ( c.replayingInfo &&
             c.replayingInfo.replaying ) {
          return 'cyan';
        }
        return '';
      });

      this.add(this.completeLabel);
      this.add(this.etaLabel);
      this.add(this.indexLabel);
      this.add(this.replayIndexLabel);

      this.refresh();
    },
    {
      name: 'refresh',
      code: async function(self = this) {
        console.log('ReplayingInfoCView.refresh '+self.children.length);
        if ( self.config ) {
          self.config = await self.dao.find(self.config.id);
//          self.updateReplaying();
          for ( var i = 0; i < self.children.length; i++ ) {
            let child = self.children[i];
            child.refresh && child.refresh(child);
          }
          self.invalidate();
        }
      }
    },
    // {
    //   name: 'updateReplaying',
    //   code: function() {
    //     if ( this.config.replayingInfo ) {
    //       if ( this.config.replayingInfo.replaying &&
    //            this.config.replayingInfo.replayIndex > 0 ) {
    //         this.color = 'cyan';
    //         // this.start = (1 - this.config.replayingInfo.percentComplete ) * (2 *
    //                                                                          Math.PI);
    //         // this.complete = this.config.replayingInfo.percentComplete;
    //         // this.eta = this.config.replayingInfo.timeRemaining;
    //         // this.index = this.config.replayingInfo.index;
    //         // this.replayIndex = this.config.replayingInfo.replayIndex;
    //       } else {
    //         this.color = '';
    //         // this.complete = '';
    //         // this.eta == this.config.replayingInfo.tps;
    //         // this.index = this.config.replayingInfo.index;
    //         // this.replayIndex = '';
    //       }
    //     }
    //   }
    // },
    {
      name: 'handleClick',
      code: function(evt, element) {
        console.log('ReplayingInfoCView.handleClick');
        if ( this.config.replayingInfo ) {
          for ( var i = 0 ; i < this.children.length ; i++ ) {
            let child = this.children[i];
            if ( child.cls_.id == this.ReplayingInfoDetailCView.id ) {
              return;
            }
          }

          if ( this.infoView ) {
            element.canvas.remove(this.infoView);
            this.infoView = undefined;
          } else {
            var r = this.ReplayingInfoDetailCView.create({
              config: this.config,
              alpha: 0.8,
              x: evt.offsetX,
              y: evt.offsetY
            });
            r.y = r.y - r.height/2;
            this.infoView = r;
            element.canvas.add(r);
          }
        }
      }
    },
    // {
    //   name: 'handleRightClick',
    //   code: function(evt, element) {
    //     console.log(this.cls_.id+'.handleRightClick');
    //   }
    // },
    // {
    //   name: 'handleMouseMove',
    //   code: function(evt, element) {
    //     console.log(this.cls_.id+'.handleMouseMove');
    //   }
    // }
  ]
});
