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
    'capabilityCache',
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
    { name: 'TITLE', message: 'Welcome to Capability unlock options' },
    { name: 'CAP_TITLE', message: 'Capabilities Available' },
    { name: 'SUBTITLE_1', message: 'You do not have access to undertake your previous selected action.' },
    { name: 'SUBTITLE_2', message: 'Please select one of the following capabilities, to unlock full feature.' }
  ],

  css: `
    ^{  
      width: 55vw;
      text-align: center;
    }
    ^detail-container {
      overflow-y: scroll;
      width: 45%;
    }
    ^mainSection {
      display: flex;
      justify-content: space-between;
      padding: 24px;
    }
    ^capList-css {
      overflow: scroll;
      height: 53vh;
    }
    ^legendSize {
      width: 47%;
    }
    ^ .foam-u2-layout-Rows {
      display: initial;
      border-style: solid;
      border-width: thin;
    }
    h1 {
      margin-bottom: 5px;
    }
    h3 {
      text-decoration: underline;
    }
    h4 {
      margin-block-start: 0;
      margin: 0;
      padding: 0;
      margin-block-end: 0;
      margin-bottom: 0;
    }
  `,

  methods: [
    function initE() {
      this.data.capabilityOptions.forEach(c => {
        if ( this.capabilityCache.has(c) && this.capabilityCache.get(c) ) {
          this.aquire();
        }
      });

      var self = this;
      this
        .addClass(this.myClass())
        .start('h1').add(this.TITLE).end()
        .start('h4').add(this.SUBTITLE_1).end()
        .start('h4').add(this.SUBTITLE_2).end()
        .start().addClass(this.myClass('mainSection'))
          .start(this.Rows)
            .addClass(this.myClass('detail-container'))
            .start('h3').add(this.CAP_TITLE).end()
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
              }).addClass(this.myClass('capList-css'));
            }))
          .end()
          .start().addClass(this.myClass('legendSize')).tag(foam.u2.view.EnumLegendView, { of: foam.nanos.crunch.CapabilityJunctionStatus, enumValueToHide: ['APPROVED'] }).end()
        .end()
        .startContext({ data: this })
          .tag(this.CANCEL, { buttonStyle: 'SECONDARY' })
        .endContext();
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
        this.capabilityCache.set(c, true);
      });
      this.onClose(x);
    },

    function reject(x) {
      x = x || this.__subSubContext__;
      this.data.cancelled = true;
      this.data.capabilityOptions.forEach(c => {
        this.capabilityCache.set(c, true);
      });
      this.onClose(x);
    }
  ],

  actions: [
    {
      name: 'cancel',
      label: 'Close',
      code: function(x) {
        this.reject(x);
      }
    }
  ]
});
