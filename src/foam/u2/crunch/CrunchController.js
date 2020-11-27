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
    'foam.u2.crunch.wizardflow.CheckRootIdAgent',
    'foam.u2.crunch.wizardflow.CheckPendingAgent',
    'foam.u2.crunch.wizardflow.CheckNoDataAgent',
    'foam.u2.crunch.wizardflow.LoadCapabilitiesAgent',
    'foam.u2.crunch.wizardflow.CreateWizardletsAgent',
    'foam.u2.crunch.wizardflow.LoadWizardletsAgent',
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
    {
      name: 'createWizardSequence',
      documentation: `
        Create the default wizard sequence for the specified capability in
        association with the user. The wizard can be 
      `,
      code: function createWizardSequence(capabilityOrId, x) {
        if ( ! x ) x = this.__subContext__;
        return this.Sequence.create(null, x.createSubContext({
          rootCapability: capabilityOrId
        }))
          .add(this.ConfigureFlowAgent)
          .add(this.CapabilityAdaptAgent)
          .add(this.LoadCapabilitiesAgent)
          // TODO: remove CheckRootIdAgent after phase 2 fix on PENDING
          .add(this.CheckRootIdAgent)
          .add(this.CheckPendingAgent)
          .add(this.CheckNoDataAgent)
          .add(this.CreateWizardletsAgent)
          .add(this.LoadWizardletsAgent)
          .add(this.FilterWizardletsAgent)
          .add(this.RequirementsPreviewAgent)
          .add(this.LoadTopConfig)
          .add(this.StepWizardAgent)
          .add(this.PutFinalJunctionsAgent)
          // .add(this.TestAgent)
          ;
      }
    },
    {
      name: 'createCapableWizardSequence',
      documentation: `
        Create the default wizard sequence for the specified Capable object
        intercept.
        
        A Capable object intercept occurs when the server replies with an object
        implementing Capable. These objects can have data requirements in the
        form of capabilities that are stored object-locally rather than in
        association with a user.
      `,
      code: function createCapableWizardSequence(intercept, capable) {
        return this.Sequence.create(null, this.__subContext__.createSubContext({
          intercept: intercept,
          capable: capable
        }))
          .add(this.ConfigureFlowAgent)
          .add(this.CapableDefaultConfigAgent)
          .add(this.CapableCreateWizardletsAgent)
          .add(this.LoadWizardletsAgent)
          .add(this.StepWizardAgent)
          .add(this.MaybeDAOPutAgent)
          ;
      }
    },

    function handleIntercept(intercept) {
      var self = this;

      intercept.capabilities.forEach((c) => {
        self.capabilityCache.set(c, false);
      });

      // Allow zero or more promises to block this method
      let p = Promise.resolve();

      // Intercept view for regular user capability options
      console.log('intercept', intercept)
      if ( intercept.capabilities.length > 1 ) {
        p = p.then(() => {
          return self.maybeLaunchInterceptView(intercept);
        });
      }
      else if ( intercept.capabilities.length > 0 ) {
        p = p.then(() => {
          return self.createWizardSequence(intercept.capabilities[0])
            .execute();
        });
      }

      let isCapable = intercept.capables.length > 0;

      // Wizard for Capable objects and required user capabilities
      // (note: no intercept view; this case immediately invokes a wizard)
      if ( isCapable ) {
        p = p.then(x => {
          if ( ! x || x.submitted ) {
            return self.launchCapableWizard(intercept);
          }
          return x;
        });
      }
      
      p = p.then(x => {
        var isCompleted = x.submitted || x.cancelled;

        if ( isCapable ) {
          intercept.capables[0].isWizardIncomplete = ! isCompleted;
          if ( ! isCompleted ) {
            intercept.resolve(intercept.capables[0]);
            return;
          }
          intercept.returnCapable.isWizardIncomplete = ! isCompleted;
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
        activeIntercept.capabilities.forEach((capOpt) => {
          if ( ! intercept.capabilities.includes(capOpt) ) {
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
                resolve(x);
              }
            })
        );
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

      intercept.capables.forEach(capable => {
        var seq = this.createCapableWizardSequence(intercept, capable);
        p = p.then(() => {
          return seq.execute().then(x => {
            return x;
          });
        });
      })

      return p;
    },

    // This function is only called by CapableView
    function getWizardletsFromCapable(capable) {
      return this.Sequence.create(null, this.__subContext__.createSubContext({
        capable: capable
      }))
        .add(this.CapableCreateWizardletsAgent)
        .add(this.LoadWizardletsAgent)
        .execute().then(x => x.wizardlets);
    }
  ]
});
