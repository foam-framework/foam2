/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'CapabilityInterceptView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.u2.crunch.CapabilityCardView',
    'foam.u2.layout.Rows'
  ],

  imports: [
    'capabilityDAO',
    'crunchController',
    'crunchService',
    'notify'
  ],

  properties: [
    {
      name: 'onClose',
      class: 'Function',
      factory: function() {
        return x => x.closeDialog();
      }
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Missing Capability' },
    { name: 'LABEL_CAP_LIST', message: 'CAPABILITIES' },
    { name: 'SUBTITLE_1', message: 'You are currently incapable of performing this action.' },
    { name: 'SUBTITLE_2', message: 'Please refer to the following list on how to obtain the capability.' }
  ],

  css: `
    ^{
      display: flex;
      flex-direction: column;
      width: 55vw;
      padding: 24px;
      max-height: 75%;
    }
    ^container-close {
      display: flex;
      justify-content: flex-end;
    }
    ^container-close button {
      padding: 0;
    }
    ^container-close img {
      margin-right: 0;
      width: 16px;
    }
    ^container-title {
      text-align: center;
      margin-top: 16px;
    }
    ^detail-container {
      overflow-y: scroll;
      width: 100%;
    }
    ^main-section {
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      padding: 80px;

      max-height: 60%;
      overflow-y: scroll;
    }
    ^label-title {
      margin: 0;

      font-size: 32px;
      font-weight: bold;
      letter-spacing: 1;
    }
    ^label-subtitle {
      margin: 0;
      margin-top: 8px;

      font-size: 16px;
      color: #5e6061;
    }
    ^label-subtitle:last-child {
      margin-top: 0;
    }
    ^label-cap {
      margin: 0;
      font-weight: bold;
      font-size: 12px;
    }
    ^detail-container .foam-u2-crunch-Style-mode-circle {
      width: 100%;
      margin: 8px 0;
    }

    ^detail-container .foam-u2-crunch-Style-mode-circle:hover {
      border-color: #f3f3f3;
    }
  `,

  methods: [
    function initE() {
      this.data.capabilityOptions.forEach(c => {
        if (
          this.crunchController.capabilityCache.has(c) &&
          this.crunchController.capabilityCache.get(c)
        ) {
          this.aquire();
        }
      });

      var self = this;
      this
        .addClass(this.myClass())
        .start().addClass(this.myClass('container-close'))
          .startContext({ data: this })
            .tag(this.CANCEL, { buttonStyle: 'TERTIARY' })
          .endContext()
        .end()
        .start().addClass(this.myClass('container-title'))
          .start('p').addClass(this.myClass('label-title')).add(this.TITLE).end()
          .start()
            .start('p').addClass(this.myClass('label-subtitle')).add(this.SUBTITLE_1).end()
            .start('p').addClass(this.myClass('label-subtitle')).add(this.SUBTITLE_2).end()
          .end()
        .end()
        .start().addClass(this.myClass('main-section'))
          .start('p').addClass(this.myClass('label-cap')).add(this.LABEL_CAP_LIST).end()
          .start(this.Rows)
            .addClass(this.myClass('detail-container'))
            .add(this.slot(function(data$capabilityOptions) {
              return this.E().select(this.capabilityDAO.where(
                self.IN(self.Capability.ID, data$capabilityOptions)
              ), cap => {
                return this.E().tag(self.CapabilityCardView, {
                    data: cap
                  })
                  .on('click', () => {
                    self.crunchController
                      .createWizardSequence(cap.id).execute();
                  });
              });
            }))
          .end()
        .end();
    },

    // TODO - add feature to capture wizard close for a capability:

    // First attempt:
    //   call checkStatus() on  promise resolve of launchWizard
    //   code:
    //     var p = self.crunchController.launchWizard(cap.id);
    //     p.then(() => self.checkStatus(cap));
    // Second attempt:
    //   add property to crunchController that changes on close,
    //   and add a listener checkStatus(cap) that listens to property change of crunchController

    // neither above works but don't want to delete this. Could be a nice feature.

    // function checkStatus(cap) {
    //   // Query UCJ status
    //   this.crunchService.getJunction(ctrl.__subContext__, cap.id).then(ucj => {
    //     if ( ucj && ucj.status === this.CapabilityJunctionStatus.GRANTED ) this.aquire();
    //     else this.reject();
    //   });
    // },

    function aquire(x) {
      x = x || this.__subSubContext__;
      this.data.aquired = true;
      this.data.capabilityOptions.forEach(c => {
        this.crunchController.capabilityCache.set(c, true);
      });
      this.onClose(x);
    },

    function reject(x) {
      x = x || this.__subSubContext__;
      this.data.cancelled = true;
      this.data.capabilityOptions.forEach(c => {
        this.crunchController.capabilityCache.set(c, true);
      });
      this.onClose(x);
    }
  ],

  actions: [
    {
      name: 'cancel',
      icon: 'images/ic-cancelgray.svg',
      label: '',
      code: function(x) {
        this.reject(x);
      }
    }
  ]
});
