foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'CapabilityView',
  extends: 'foam.u2.View',
  documentation: 'All purpose capability view that takes in an array of capaiblity ids and displays these capabilities',

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

  properties: [
    {
      class: 'StringArray',
      name: 'capabilityIDs'
    },
    {
      name: 'capabilities',
      value: []
    },
    {
      name: 'wizardlets',
      documentation: 'wizardlets for the capability',
      value: []
    },
    {
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

        // pre-populate wizardlets' data
        this.populateData(curWizardlets);

        // add listeners on wizardlets
        curWizardlets.forEach(wizardlet => this.addListeners(wizardlet, wizardlet.data));

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
    function addListeners(wizardlet, data) {
      if ( ! this.isFObject(data) ) return;

      data.sub(this.updateWizardlet.bind(this, wizardlet));

      // add listeners on obj in wizardlet.data
      for ( let obj of Object.values(data.instance_) ) {
        if ( this.isFObject(obj) ) {
          obj.sub(this.updateWizardlet.bind(this, wizardlet));
        }
      }
    },

    function isFObject(obj) {
      return typeof obj === 'object' && obj.instance_;
    },

    function populateData(wizardlets) {
      for ( let wizardlet of wizardlets ) {
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
        wizardlet.save().then(() => {
          this.saveNoDataCaps(this.capabilities);
        }).catch(err => {
          this.notify(err.message, '', this.LogLevel.ERROR, true);
        });
      }
    }
  ]
});
