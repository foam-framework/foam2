/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'CapabilityView',
  extends: 'foam.u2.View',
  documentation: 'All purpose capability view that takes in an array of capability ids and displays those capabilities',

  imports: [
    'crunchController',
    'notify',
    'subject',
    'userCapabilityJunctionDAO'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.u2.detail.SectionView'
  ],

  constants: [
    {
      name: 'MAX_DEPTH',
      type: 'Integer',
      value: 5,
      documentation: 'max. depth addListeners can move down on recursion'
    }

  ],

  properties: [
    {
      class: 'StringArray',
      name: 'capabilityIDs'
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.crunch.Capability',
      name: 'capabilities',
      value: []
    },
    {
      class: 'FObjectArray',
      of: 'foam.u2.wizard.BaseWizardlet',
      name: 'wizardlets',
      documentation: 'wizardlets for the capability',
      value: []
    },
    {
      class: 'Array',
      name: 'wizardletSectionsList',
      documentation: `
        sections for wizardlets
        wizardletSectionsList[i] stores sections for wizardlets[i]
      `,
      value: []
    },
    {
      name: 'showTitle',
      value: false
    }
  ],

  methods: [
    async function init() {
      for ( let capID of this.capabilityIDs ) {
        // get capabilities and wizardlets for capID
        const { caps: curCaps, wizCaps: curWizardlets } =
          await this.crunchController.getCapsAndWizardlets(capID);

        // pre-populate curWizardlets' data and add listeners to it
        for ( let wizardlet of curWizardlets ) {
          this.populateData(wizardlet);
          this.addListeners(wizardlet, wizardlet.data);
        }

        // get all the sections associated with curWizardlets
        const curWizardletSectionsList = this.crunchController.generateSections(curWizardlets);

        this.capabilities = this.capabilities.concat(curCaps);
        this.wizardlets = this.wizardlets.concat(curWizardlets);
        this.wizardletSectionsList = this.wizardletSectionsList.concat(curWizardletSectionsList);
      }
    },

    async function initE() {
      const self = this;

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

    // add a listener to wizardlet.data and each wizardlet.data obj
    // for the purpose of saving all user inputs releasing
    // calling views from the responsibility
    function addListeners(wizardlet, obj, depth=0) {
      // Some obj (e.g., dao) have a long chain of nested objects
      // which causes a stack overflow. Such objects don't need listeners
      // as they are dependent on other objects that are updated by user inputs
      // so we set depth to prevent a stack overflow while setting listeners on
      // all the necessary objects
      if ( ! this.isFObject(obj) || depth > this.MAX_DEPTH ) return;

      // add listeners on wizardlet data
      obj.sub(this.updateWizardlet.bind(this, wizardlet));

      // add listeners on inner objects for obj
      for ( let innerObj of Object.values(obj.instance_) ) {
        if ( this.isFObject(innerObj) ) {
          this.addListeners(wizardlet, innerObj, ++depth);
        }
      }
    },

    function isFObject(obj) {
      return typeof obj === 'object' && obj['instance_'] !== undefined;
    },

    function populateData(wizardlet) {
      // get all the properties for this wizardlet
      const properties = wizardlet.capability.of.getAxiomsByClass(foam.core.Property);

      // add property to wizardlet data if the property is an object and does not
      // exist in wizardlet data
      for ( let p of properties ) {
        if ( ! wizardlet.data[p.name] && p.of ) {
          let pClassName = p.of.id;
          wizardlet.data[p.name] = foam.lookup(pClassName).create({}, this);
        }
      }
    },

    function saveNoDataCaps(capabilities) {
      return new Promise(wizardResolve => {
        // save no-data capabilities (i.e. not displayed in wizard)
        Promise.all(capabilities.filter(cap => ! cap.of).map(
          cap => this.userCapabilityJunctionDAO.put(this.UserCapabilityJunction.create({
            sourceId: this.subject.user.id,
            targetId: cap.id
          }))
        )).then(() => {
          wizardResolve();
        });
      });
    },
  ],

  listeners: [
    {
      name: 'updateWizardlet',
      code: function(wizardlet) {
        try {
          wizardlet.save();
          this.saveNoDataCaps(this.capabilities);
        } catch (err) {
          this.notify(err.message, '', this.LogLevel.ERROR, true);
        };
      }
    }
  ]
});
