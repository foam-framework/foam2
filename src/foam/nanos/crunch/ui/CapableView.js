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
      factory: function() {
        if ( this.capableObj === undefined ) return [];
        return this.crunchController.getCapableWizard(this.capableObj);
      },
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

      // set capable payloads for capabilities (stored as an array in capableRequirements)
      await this.capableObj.setRequirements(this.capableObj.capableRequirements);

      this.start().addClass(this.myClass())
        .add(self.slot(function(wizardletSectionsList) {
          return this.E().forEach(wizardletSectionsList, function(sections, index) {
            sections.map(section => (
              this.tag(self.SectionView, {
                section,
                data: self.wizardlets[index].data,
                showTitle: self.showTitle
              })
            ));
          });
        }))
      .end();
    },

    // add listeners to payloads
    function addListeners() {
      for ( payload of this.capableObj.capablePayloads ) {
        payload.data.sub(this.clonePayloads.bind(this));
      }
    }
  ],

  listeners: [
    {
      name: 'clonePayloads',
      documentation: `
        This listener reassgins capablePayloads array each time its element gets updated.
        The purpose of this is to listen to changes for payloads in bankAccountWizard save.
      `,
      code: function() {
        this.capableObj.capablePayloads = [...this.capableObj.capablePayloads];
      }
    }
  ]
});
