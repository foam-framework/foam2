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
    'subject',
    'userCapabilityJunctionDAO'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.crunch.ui.CapabilityWizardlet',
    'foam.u2.borders.MarginBorder',
    'foam.u2.crunch.CapabilityInterceptView',
    'foam.u2.detail.AbstractSectionedDetailView',
    'foam.u2.dialog.Popup'
  ],

  messages: [
    { name: 'CANNOT_OPEN_GRANTED', message: 'This capability has already been granted to you.' },
    { name: 'CANNOT_OPEN_PENDING', message: 'This capability is awaiting approval, updates are not permitted at this time.' },
    { name: 'CANNOT_OPEN_ACTION_PENDING', message: 'This capability is awaiting review, updates are not permitted at this time.' }
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
    function getTC(capabilityId) {
      var tcList = [];
      var tcRecurse = () => {};
      // Pre-Order Traversial of Capability Dependancies.
      // Using Pre-Order here will cause the wizard to display
      // dependancies in a logical order.
      tcRecurse = (sourceId, seen) => {
        if ( ! seen ) seen = [];
        return this.prerequisiteCapabilityJunctionDAO.where(this.AND(
          this.EQ(this.CapabilityCapabilityJunction.SOURCE_ID, sourceId),
          this.NOT(this.IN(this.CapabilityCapabilityJunction.TARGET_ID, seen))
        )).select().then((result) => {
          var arry = result.array;

          if ( arry.length == 0 ) {
            tcList.push(sourceId);
            return;
          }

          return arry.reduce(
            (p, pcj) => p.then(() => tcRecurse(pcj.targetId, seen.concat(arry.map((pcj) => pcj.targetId)))),
            Promise.resolve()
          ).then(() => tcList.push(sourceId));
        });
      };

      return tcRecurse(capabilityId, []).then(() => [...new Set(tcList)]);
    },

    function getCapabilities(capabilityId) {
      return Promise.resolve(
        this.getTC(capabilityId).then(
          tcList => Promise.all(tcList.map(
            capId => this.capabilityDAO.find(capId))
          )
        ));
    },

    function getCapsAndWizardlets(capabilityId) {
      return this.getCapabilities(capabilityId).then( (capabilities) => {
        return Promise.all([
          Promise.resolve(capabilities),
          Promise.all(capabilities
            .filter(cap => !! cap.of )
            .map(cap =>
              this.CapabilityWizardlet.create({ capability: cap }).updateUCJ())
            )
          ]).then((capAndSections) => {
            return {
              caps: capAndSections[0],
              wizCaps: capAndSections[1]
                .filter((wizardSection) =>
                  wizardSection.ucj === null ||
                  (
                    wizardSection.ucj.status != this.CapabilityJunctionStatus.GRANTED &&
                    wizardSection.ucj.status != this.CapabilityJunctionStatus.PENDING
                  ))
            };
          });
      });
    },

    function generateSections(generatedWizardlets) {
      return generatedWizardlets.map(wizardlet =>
        this.AbstractSectionedDetailView.create({
          of: wizardlet.of
        }).sections);
    },

    function generateAndDisplayWizard(capabilitiesSections) {
      // called in CapabilityRequirementView
      return ctrl.add(this.Popup.create({ closeable: false }).tag({
        class: 'foam.u2.wizard.StepWizardletView',
        data: foam.u2.wizard.StepWizardletController.create({
          wizardlets: capabilitiesSections.wizCaps
        }),
        onClose: (x) => {
          this.finalOnClose(x, capabilitiesSections.caps);
        }
      }));
    },

    async function startWizardFlow(capabilityId, toLaunchOrNot) {
      return this.getCapsAndWizardlets(capabilityId)
        .then((capabilitiesSections) => {
          // generate and popUp summary view (CapabilityRequirmentView) before wizard
          return this.onStartShowPopRequirements(capabilityId, capabilitiesSections, toLaunchOrNot);
        });
    },

    function finalOnClose(x, capabilities) {
      return new Promise((wizardResolve) => {
        x.closeDialog();
        // Save no-data capabilities (i.e. not displayed in wizard)
        Promise.all(capabilities.filter(cap => ! cap.of).map(
          cap => this.userCapabilityJunctionDAO.put(this.UserCapabilityJunction.create({
            sourceId: this.subject.user.id,
            targetId: cap.id
          })).then(() => {
            console.log('SAVED (no-data cap)', cap.id);
          })
        )).then(() => {
          wizardResolve();
        });
      });
    },

    async function launchWizard(capabilityId) {
      var ucj = await this.userCapabilityJunctionDAO.find(
        this.AND(
          this.EQ(this.UserCapabilityJunction.SOURCE_ID, this.subject.user.id),
          this.EQ(this.UserCapabilityJunction.TARGET_ID, capabilityId)
        ));
      if ( ucj ) {
        var statusGranted = ucj.status === this.CapabilityJunctionStatus.GRANTED;
        var statusPending = ucj.status === this.CapabilityJunctionStatus.PENDING;
        if ( statusGranted || statusPending ) {
          var message = statusGranted ? this.CANNOT_OPEN_GRANTED : this.CANNOT_OPEN_PENDING;
          this.ctrl.notify(message, '', this.LogLevel.INFO, true);
          return;
        }
        var nothingTodo = ucj.status === this.CapabilityJunctionStatus.ACTION_REQUIRED;
        return this.startWizardFlow(capabilityId, nothingTodo);
      }
      return this.startWizardFlow(capabilityId, false);
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
      var self = this;
      self.ctrl.add(self.Popup.create({ closeable: false })
        .start(self.MarginBorder)
          .tag(self.CapabilityInterceptView, {
            data: intercept
          })
        .end()
      );
      return intercept.promise;
    },

    function onStartShowPopRequirements(capabilityId, capabilitiesSections, toLaunchOrNot) {
      // toLaunchOrNot is true if ucj or capabilityId is in ActionRequired
      if ( toLaunchOrNot && capabilitiesSections.caps.length < 1 ) {
        // This is here because of a CertifyDataReviewed capability.
        this.ctrl.notify(this.CANNOT_OPEN_ACTION_PENDING);
        return;
      }
      var sectionsList = this.generateSections(capabilitiesSections.wizCaps);
      var arrOfRequiredCapabilities = sectionsList.flat()
        .filter(eachSection => eachSection && eachSection.help)
        .map(eachSection => eachSection.help);
      if ( arrOfRequiredCapabilities.length < 1 ) {
        // if nothing to show don't open this dialog - push directly to wizard
        this.generateAndDisplayWizard(capabilitiesSections);
      } else {
        return this.ctrl.add(
          this.Popup.create({ closeable: false }, this.ctrl.__subContext__).tag({
            class: 'foam.u2.crunch.CapabilityRequirementView',
            arrayRequirement: arrOfRequiredCapabilities,
            functionData: capabilitiesSections,
            capabilityId: capabilityId
          })).end();
      }
    }
  ]
});
