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
    'foam.u2.crunch.wizardflow.FilterWizardletsAgent',
    'foam.u2.crunch.wizardflow.RequirementsPreviewAgent',
    'foam.u2.crunch.wizardflow.StepWizardAgent',
    'foam.u2.crunch.wizardflow.PutFinalJunctionsAgent',
    'foam.u2.crunch.wizardflow.TestAgent',
    'foam.u2.crunch.wizardflow.LoadTopConfig',
    'foam.u2.crunch.wizardflow.CapableDefaultConfigAgent',
    'foam.u2.crunch.wizardflow.CapableCreateWizardletsAgent',
    'foam.u2.crunch.wizardflow.MaybeDAOPutAgent',
    'foam.util.async.Sequence',
    'foam.u2.borders.MarginBorder',
    'foam.u2.crunch.CapabilityInterceptView',
    'foam.u2.dialog.Popup'
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
    },
    {
      class: 'Map',
      name: 'capabilityCache',
      factory: function() {
        return new Map();
      }
    },
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
        .add(this.FilterWizardletsAgent)
        .add(this.RequirementsPreviewAgent)
        .add(this.LoadTopConfig)
        .add(this.StepWizardAgent)
        .add(this.PutFinalJunctionsAgent)
        // .add(this.TestAgent)
        ;
    },

    // Excludes UCJ-related logic
    function createCapableWizardSequence(intercept, capable) {
      return this.Sequence.create(null, this.__subContext__.createSubContext({
        intercept: intercept,
        capable: capable
      }))
        .add(this.ConfigureFlowAgent)
        .add(this.CapableDefaultConfigAgent)
        .add(this.CapableCreateWizardletsAgent)
        .add(this.StepWizardAgent)
        .add(this.MaybeDAOPutAgent)
        ;
    },

    function handleIntercept(intercept) {
      var self = this;

      intercept.capabilityOptions.forEach((c) => {
        self.capabilityCache.set(c, false);
      });

      // Allow zero or more promises to block this method
      let p = Promise.resolve();

      // Intercept view for regular user capability options
      if ( intercept.capabilityOptions.length > 0 ) {
        p = p.then(() => {
          return self.maybeLaunchInterceptView(intercept);
        });
      }

      let isCapable = intercept.capableRequirements.length > 0;

      // Wizard for Capable objects and required user capabilities
      // (note: no intercept view; this case immediately invokes a wizard)
      if ( isCapable ) {
        p = p.then(() => self.launchCapableWizard(intercept));
      }
      
      p = p.then(isCompleted => {
        intercept.capableRequirements[0].isWizardCompleted = isCompleted;

        if ( isCapable ) {
          if ( ! isCompleted ) {
            intercept.resolve(intercept.capableRequirements[0]);
            return;
          }
          intercept.returnCapable.isWizardCompleted = isCompleted;
          intercept.resolve(intercept.returnCapable);
          return;
        }
        intercept.resend();
      })

      p.catch(err => {
        intercept.reject(err.data);
      })

      return p;
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
      return new Promise((resolve, _) => {
        this.ctrl.add(this.Popup.create({ closeable: false })
            .tag(this.CapabilityInterceptView, {
              data: intercept,
              onClose: (x) => {
                x.closeDialog();
                resolve();
              }
            })
        );
      });
    },

    function save(wizardlet) {
      if ( ! wizardlet.isAvailable ) return Promise.resolve();
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
    function launchCapableWizard(intercept) {
      var p = Promise.resolve(true);

      intercept.capableRequirements.forEach(capable => {
        var seq = this.createCapableWizardSequence(intercept, capable);
        p = p.then(() => {
          return seq.execute().then(x => {
            return x.submitted;
          });
        });
      })

      return p;
    },

    // This function is only called by CapableView
    function getWizardletsFromCapable(capable) {
      return this.Sequence.create(null, this.__subContext__.createSubContext({
        capable: capable
      })).add(this.CapableCreateWizardletsAgent).execute().then(x => x.wizardlets);
    }
  ]
});
