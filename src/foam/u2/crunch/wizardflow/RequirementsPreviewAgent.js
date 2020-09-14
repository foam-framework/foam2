/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'RequirementsPreviewAgent',

  implements: [ 'foam.core.ContextAgent' ],

  imports: [
    'capabilities',
    'ctrl',
    'endSequence',
    'rootCapability',
    'wizardlets'
  ],

  requires: [
    'foam.u2.detail.AbstractSectionedDetailView',
    'foam.u2.dialog.Popup'
  ],

  methods: [
    // If Property expressions ever unwrap promises this method can be blank.
    function execute() {
      var sectionsList = this.generateSections(this.wizardlets);
      var arrOfRequiredCapabilities = sectionsList.flat()
        .filter(eachSection => eachSection && eachSection.help)
        .map(eachSection => eachSection.help);
      if ( arrOfRequiredCapabilities.length < 1 ) {
        // if nothing to show don't open this dialog - push directly to wizard
        return Promise.resolve();
      } else {
        return new Promise((resolve, _) => {
          this.ctrl.add(
            this.Popup.create({ closeable: false }, this.ctrl.__subContext__).tag({
              class: 'foam.u2.crunch.CapabilityRequirementView',
              arrayRequirement: arrOfRequiredCapabilities,
              functionData: { caps: this.capabilities },
              capabilityId: this.rootCapability.id,
              onClose: (x, isContinueAction) => {
                resolve(isContinueAction);
              }
            })
          ).end();
        }).then(isContinueAction => {
          if ( ! isContinueAction ) {
            this.endSequence();
            return Promise.resolve();
          }
        })
      }
    },

    function generateSections(generatedWizardlets) {
      return generatedWizardlets.map(wizardlet =>
        this.AbstractSectionedDetailView.create({
          of: wizardlet.of
        }).sections);
    }
  ]
});
