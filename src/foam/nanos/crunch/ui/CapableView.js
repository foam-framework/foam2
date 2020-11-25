/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'CapableView',
  extends: 'foam.u2.View',
  documentation: 'A view for displaying capable objects',

  imports: [
    'crunchController',
    'notify',
    'subject',
    'userCapabilityJunctionDAO'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.u2.detail.AbstractSectionedDetailView',
    'foam.u2.detail.SectionView'
  ],

  css: `
    ^ .foam-u2-detail-SectionedDetailPropertyView .foam-u2-CheckBox-label {
      top: 0px;
      position: relative;
    }
  `,

  properties: [
    {
      name: 'capableObj',
      documentation: 'a capable object'
    },
    {
      class: 'FObjectArray',
      of: 'foam.u2.wizard.BaseWizardlet',
      name: 'wizardlets',
      documentation: 'wizardlets for capable payloads',
      postSet: function() {
        this.addListeners();
      }
    },
    {
      class: 'Array',
      name: 'wizardletSectionsList',
      documentation: `
        sections for wizardlets
        wizardletSectionsList[i] stores sections for wizardlets[i]
      `,
      factory: function() {
        return this.wizardlets.map(wizardlet =>
          this.AbstractSectionedDetailView.create({
            of: wizardlet.of
          }).sections);
      }
    },
    {
      class: 'Boolean',
      name: 'showTitle'
    }
  ],

  methods: [
    async function initE() {
      this.SUPER();

      const self = this;

      // set capable payloads to capabilities if the capbilities don't have payloads yet
      const hasNoPayloads = ! this.capableObj.capablePayloads ||
        Object.keys(this.capableObj.capablePayloads).length === 0;

      if ( hasNoPayloads ) {
          try {
            await this.capableObj.setRequirements(this.capableObj.capableRequirements);
          } catch (e) {
            this.notify(e.message, '', this.LogLevel.ERROR, true);
          }
      }

      // set wizardlets based on the capableObj
      this.wizardlets = this.capableObj ?
        await this.crunchController.getWizardletsFromCapable(this.capableObj) : [];

      this.start().addClass(this.myClass())
        .forEach(this.wizardletSectionsList, function(sections, index) {
          sections.map(section => (
            this.tag(self.SectionView, {
              section,
              data: self.wizardlets[index].data,
              showTitle: self.showTitle
            })
          ));
        }).end()
      .end();
    },

    // add listeners to payloads
    function addListeners() {
      for ( payload of this.capableObj.capablePayloads ) {
        payload.data.sub(this.clonePayloads);
      }
    }
  ],

  listeners: [
    {
      name: 'clonePayloads',
      documentation: `
        This listener reassgins capablePayloads array each time its elements get updated.
        The purpose of this is to listen to changes for payloads of a capable object
        that calls this view. (e.g., for bank accounts which are an capable object, we want to
        know if acceptance doc payloads are valid or not)
      `,
      code: function() {
        this.capableObj.capablePayloads = [...this.capableObj.capablePayloads];
      }
    }
  ]
});
