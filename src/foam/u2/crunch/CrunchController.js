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
    'capabilityCategoryDAO',
    'crunchService',
    'ctrl',
    'prerequisiteCapabilityJunctionDAO',
    'stack',
    'subject',
    'userCapabilityJunctionDAO'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.u2.crunch.wizardflow.ConfigureFlowAgent',
    'foam.u2.crunch.wizardflow.CapabilityAdaptAgent',
    'foam.u2.crunch.wizardflow.CheckPendingAgent',
    'foam.u2.crunch.wizardflow.LoadCapabilitiesAgent',
    'foam.u2.crunch.wizardflow.CreateWizardletsAgent',
    'foam.u2.crunch.wizardflow.RequirementsPreviewAgent',
    'foam.u2.crunch.wizardflow.StepWizardAgent',
    'foam.u2.crunch.wizardflow.PutFinalJunctionsAgent',
    'foam.u2.crunch.wizardflow.TestAgent',
    'foam.util.async.Sequence',
    'foam.u2.borders.MarginBorder',
    'foam.u2.crunch.CapabilityInterceptView'
  ],

  properties: [
    {
      name: 'activeIntercepts',
      class: 'Array',
      documentation: `
        Since permissions may be checked during asynchronous calls,
        it is possible that the same intercept view will be requested
        twice in a short period of time. Keeping a map of active
        intercept views is done to prevent two intercept views being
        open for the same permission (as this would be confusing for
        the user if they happen to choose the "cancel" option).

        This also allows a single intercept view to activate the
        message retry for multiple permissioned calls made
        asynchronously.
      `
    }
  ],

  methods: [
    function createWizardSequence(capabilityOrId) {
      return this.Sequence.create(null, this.__subContext__.createSubContext({
        rootCapability: capabilityOrId
      }))
        .add(this.ConfigureFlowAgent)
        .add(this.CapabilityAdaptAgent)
        .add(this.LoadCapabilitiesAgent)
        .add(this.CheckPendingAgent)
        .add(this.CreateWizardletsAgent)
        .add(this.RequirementsPreviewAgent)
        .add(this.StepWizardAgent)
        .add(this.PutFinalJunctionsAgent)
        // .add(this.TestAgent)
        ;
    },

    function maybeLaunchInterceptView(intercept) {
      // Clear stale intercepts (ones which have been closed already)
      this.activeIntercepts = this.activeIntercepts.filter((ic) => {
        return ( ! ic.aquired ) && ( ! ic.cancelled );
      });
      // Try to find a matching intercept view that's already opened.
      // NP-1426 explains this is greater detail.
      for ( let i = 0 ; i < this.activeIntercepts.length ; i++ ) {
        let activeIntercept = this.activeIntercepts[i];
        let hasAllOptions = true;

        // All options in the active intercept need to satisfy the
        // incoming intercept for this to be a match.
        activeIntercept.capabilityOptions.forEach((capOpt) => {
          if ( ! intercept.capabilityOptions.includes(capOpt) ) {
            hasAllOptions = false;
          }
        });
        if ( hasAllOptions ) {
          return activeIntercept.promise;
        }
      }
      // Register intercept for later occurances of the check above
      this.activeIntercepts.push(intercept);
      // Pop up the popup
      this.ctrl.add(this.Popup.create({ closeable: false })
        .start(this.MarginBorder)
          .tag(this.CapabilityInterceptView, {
            data: intercept
          })
        .end()
      );
      return intercept.promise;
    },

    function save(wizardlet) {
      // TODO: ignore saving when wizardlet.isAvailable === false
      var isAssociation = wizardlet.capability.associatedEntity === foam.nanos.crunch.AssociatedEntity.ACTING_USER;
      var associatedEntity = isAssociation ? this.subject.realUser : 
      wizardlet.capability.associatedEntity === foam.nanos.crunch.AssociatedEntity.USER ? this.subject.user : this.subject.realUser;

      return this.updateUCJ(wizardlet, associatedEntity).then(() => {
        var ucj = wizardlet.ucj;
        if ( ucj === null ) {
          ucj = isAssociation ? 
          this.AgentCapabilityJunction.create({
              sourceId: associatedEntity.id,
              targetId: wizardlet.capability.id,
              effectiveUser: this.subject.user.id
            })
            : this.UserCapabilityJunction.create({
              sourceId: associatedEntity.id,
              targetId: wizardlet.capability.id
            })
        }
        if ( wizardlet.of ) ucj.data = wizardlet.data;
        return this.userCapabilityJunctionDAO.put(ucj);
      });
    }, 
    async function updateUCJ(wizardlet, associatedEntity) {
      return this.userCapabilityJunctionDAO.find(
        this.AND(
          this.OR(
            this.AND(
              this.NOT(this.INSTANCE_OF(this.AgentCapabilityJunction)),
              this.EQ(this.UserCapabilityJunction.SOURCE_ID, associatedEntity.id)
            ),
            this.AND(
              this.INSTANCE_OF(this.AgentCapabilityJunction),
              this.EQ(this.UserCapabilityJunction.SOURCE_ID, associatedEntity.id),
              this.EQ(this.AgentCapabilityJunction.EFFECTIVE_USER, this.subject.user.id)
            )
          ),
          this.EQ(this.UserCapabilityJunction.TARGET_ID, wizardlet.capability.id)
        )
      ).then(ucj => {
        wizardlet.ucj = ucj;
        return wizardlet;
      });
    },
    function purgeCachedCapabilityDAOs() {
      this.capabilityDAO.cmd_(this, foam.dao.CachingDAO.PURGE);
      this.capabilityDAO.cmd_(this, foam.dao.AbstractDAO.RESET_CMD);
      this.capabilityCategoryDAO.cmd_(this, foam.dao.CachingDAO.PURGE);
      this.capabilityCategoryDAO.cmd_(this, foam.dao.AbstractDAO.RESET_CMD);
      this.userCapabilityJunctionDAO.cmd_(this, foam.dao.CachingDAO.PURGE);
      this.userCapabilityJunctionDAO.cmd_(this, foam.dao.AbstractDAO.RESET_CMD);
    },

    // CRUNCH Lite Methods
    function launchCapableWizard(capable) {
      var p = Promise.resolve(true);
      if ( capable.userCapabilityRequirements ) {
        p = capable.userCapabilityRequirements.reduce(
          (p, capabilityId) => p.then(userWantsToContinue => {
            console.log('should be a cap id', capabilityId);
            if ( ! userWantsToContinue ) return false;
            return this
              .createWizardSequence(capabilityId).execute();
          }),
          p
        );
      }
      var capableWizard = this.createCapableWizard(capable);
      p.then(userWantsToContinue => {
        ctrl.add(this.Popup.create().tag(capableWizard));
      });
    },

    function createCapableWizard(capable) {
      var wizardlets = [];
      for ( let i = 0 ; i < capable.capablePayloads.length ; i++ ) {
        let capablePayload = capable.capablePayloads[i];
        let wizardletClass = capablePayload.capability.wizardlet.cls_;

        // Override the default wizardlet class with one that does not
        //   save to userCapabilityJunction
        if ( wizardletClass.id == 'foam.nanos.crunch.ui.CapabilityWizardlet' ) {
          wizardletClass = foam.nanos.crunch.ui.CapableObjectWizardlet;
        }
        let wizardlet = wizardletClass.create({
          capability: capablePayload.capability,
          targetPayload: capablePayload
        }, capable);
        if ( capablePayload.data ) {
          wizardlet.data = capablePayload.data;
        }

        wizardlets.push(wizardlet);
      }

      console.log(wizardlets);

      return {
        class: 'foam.u2.wizard.StepWizardletView',
        data: foam.u2.wizard.StepWizardletController.create({
          wizardlets: wizardlets
        }),
        onClose: (x) => {
          x.closeDialog();
        }
      };
    }
  ]
});
