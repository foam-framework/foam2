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
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.ui.CapabilityWizardlet',
    'foam.nanos.crunch.UserCapabilityJunction',
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
    function getCapsAndWizardlets(capabilityId) {
      return this.crunchService.getGrantPath(this.__subContext__, capabilityId).then((capabilities) => {
        return Promise.all([
          Promise.resolve(capabilities),
          Promise.all(capabilities
            .filter(cap => !! cap.of )
            .map(cap => {
                var associatedEntity = cap.associatedEntity === foam.nanos.crunch.AssociatedEntity.USER ? this.subject.user : this.subject.realUser;
                var wizardlet = this.CapabilityWizardlet.create({ capability: cap });
                return this.updateUCJ(wizardlet, associatedEntity);
              })
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
          cap => {
            var associatedEntity = cap.associatedEntity === foam.nanos.crunch.AssociatedEntity.USER ? this.subject.user : this.subject.realUser;
            this.userCapabilityJunctionDAO.find(
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
                this.EQ(this.UserCapabilityJunction.TARGET_ID, cap.id))
            ).then((ucj) => {
              if ( ucj == null ) {
                ucj = this.UserCapabilityJunction.create({
                  sourceId: associatedEntity.id,
                  targetId: cap.id
                });
              }
              this.userCapabilityJunctionDAO.put(ucj).then(() => console.log('SAVED (no-data cap)', cap.id));
            });
          }
        )).then(() => {
          wizardResolve();
        });
      });
    },

    async function launchWizard(capability) {
      if ( typeof capability == 'string' ) capability = await this.capabilityDAO.find(capability);
      var associatedEntity = capability.associatedEntity === foam.nanos.crunch.AssociatedEntity.USER ? this.subject.user : this.subject.realUser;
      var ucj = await this.userCapabilityJunctionDAO.find(
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
          this.EQ(this.UserCapabilityJunction.TARGET_ID, capability.id)
        )
      );
      if ( ucj ) {
        var statusGranted = ucj.status === this.CapabilityJunctionStatus.GRANTED;
        var statusPending = ucj.status === this.CapabilityJunctionStatus.PENDING 
          || ucj.status === this.CapabilityJunctionStatus.APPROVED;
        if ( statusGranted || statusPending ) {
          var message = statusGranted ? this.CANNOT_OPEN_GRANTED : this.CANNOT_OPEN_PENDING;
          this.ctrl.notify(message, '', this.LogLevel.INFO, true);
          return;
        }
        var nothingTodo = ucj.status === this.CapabilityJunctionStatus.ACTION_REQUIRED;
        return this.startWizardFlow(capability.id, nothingTodo);
      }
      return this.startWizardFlow(capability.id, false);
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
    },
    function save(wizardlet) {
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
    }
  ]
});
