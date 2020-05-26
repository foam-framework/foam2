/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'CrunchController',
  documentation: `
    Defines behaviour for invocation of CRUNCH-related views.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'capabilityDAO',
    'ctrl',
    'prerequisiteCapabilityJunctionDAO',
    'stack',
    'userCapabilityJunctionDAO'
  ],

  requires: [
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.crunch.ui.CapabilityWizardlet',
    'foam.u2.dialog.Popup'
  ],
  
  messages: [
    { name: 'CANNOT_OPEN_GRANTED', message: 'This capability has already been granted to you.' },
    { name: 'CANNOT_OPEN_PENDING', message: 'This capability is awaiting approval, updates are not permitted at this time.' }
  ],

  methods: [
    function getTC(capabilityId) {
      var tcList = [];
      var tcRecurse = () => {}; // and we'll do it with this

      // Pre-Order Traversial of Capability Dependancies.
      // Using Pre-Order here will cause the wizard to display
      // dependancies in a logical order.
      tcRecurse = (sourceId) => {
        return this.prerequisiteCapabilityJunctionDAO.where(
          this.EQ(this.CapabilityCapabilityJunction.SOURCE_ID, sourceId)
        ).select().then((result) => {
          var arry = result.array;

          if ( arry.length == 0 ) {
            tcList.push(sourceId);
            return;
          }

          return arry.reduce(
            (p, pcj) => p.then(() => tcRecurse(pcj.targetId)),
            Promise.resolve()
          ).then(() => tcList.push(sourceId));
        });
      };

      return tcRecurse(capabilityId).then(() => tcList);
    },
    function getCapabilities(capabilityId) {
      return this.getTC(capabilityId).then(
        tcList => Promise.all(tcList.map(
          capId => this.capabilityDAO.find(capId))));
    },
    async function launchWizard(capabilityId) {
      var self = this;

      var ucj = await this.userCapabilityJunctionDAO.find(
        this.AND(
          this.EQ(this.UserCapabilityJunction.SOURCE_ID, this.user ? this.user.id : 0),
          this.EQ(this.UserCapabilityJunction.TARGET_ID, capabilityId)
        ));

      if ( ucj ) {
        var statusGranted = foam.util.equals(ucj.status, self.CapabilityJunctionStatus.GRANTED);
        var statusPending = foam.util.equals(ucj.status, self.CapabilityJunctionStatus.PENDING);
        if ( statusGranted || statusPending ) {
          var message = statusGranted ? this.CANNOT_OPEN_GRANTED : this.CANNOT_OPEN_PENDING;
          self.ctrl.notify(message);
          return;
        } 
      }
      return this.getCapabilities(capabilityId).then(capabilities => {
        // Map capabilities to CapabilityWizardSection objects
        return Promise.all(capabilities.map(
          cap => this.CapabilityWizardlet.create({
            capability: cap
          }).updateUCJ()
        ));
      }).then(sections => {
        return new Promise((wizardResolve) => {
          var pos = self.stack.pos;
          self.stack.pos$.sub(sub => {
            if ( self.stack.pos === pos ) {
              wizardResolve();
              sub.detach();
            }
          });
          sections = sections.filter(wizardSection =>
            wizardSection.ucj === null || 
            ( 
              ! foam.util.equals(wizardSection.ucj.status, self.CapabilityJunctionStatus.GRANTED ) &&
              ! foam.util.equals(wizardSection.ucj.status, self.CapabilityJunctionStatus.PENDING ) 
            )
          );
          ctrl.add(this.Popup.create({ closeable: false }).tag({
            class: 'foam.u2.wizard.StepWizardletView',
            data: foam.u2.wizard.StepWizardletController.create({
              wizardlets: sections
            }),
            onClose: x => { x.closeDialog(); }
          }));
        });
      }).catch(e => { console.log(e); });

    }
  ]
});
