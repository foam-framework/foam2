foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'MyView',
  extends: 'foam.u2.View',
  documentation: 'All purpose capability view that takes in an array of capaiblity ids and display these capabilities',

  imports: [
    'crunchController',
    'notify'
  ],

  requires: [
    'foam.u2.detail.SectionView'
  ],

  properties: [
    {
      class: 'StringArray',
      name: 'capabilities'
    },
    {
      name: 'wizardlets',
      documentation: 'wizardlets for the capability'
    },
    {
      name: 'wizardletSectionsList',
      documentation: `
        sections for wizardlets
        wizardletSectionsList[i] stores sections for wizardlets[i]
      `
    }
  ],

  methods: [
    async function initE() {
      const self = this;

      this.start().addClass(this.myClass())
        .add(this.slot(function(capabilities) {
          return this.E().forEach(capabilities, async function(cap) {
            // get wizardlets for the capability and all of its dependent capabilities
            self.wizardlets = (await self.crunchController.getCapsAndWizardlets(cap)).wizCaps;

            // add listeners on wizardlets
            for ( const wizardlet of self.wizardlets ) {
              self.addListeners(wizardlet.data);
            }

            // get all the sections associated with the wizardlets
            self.wizardletSectionsList = self.crunchController.generateSections(self.wizardlets);
            
            this.add(self.slot(function(wizardletSectionsList) {
              return this.E().forEach(wizardletSectionsList, function(sections, index) {
                sections.map(section => (
                  this.tag(self.SectionView, {
                    section,
                    data: self.wizardlets[index].data,
                    showTitle: false
                  })
                ));
              });
            }));
          });
        }))
      .end();
    },

    function addListeners(obj) {
      if ( ! this.isFObject(obj) ) return;

      obj.sub(this.updateWizardlet);

      // add listeners on inner fobjects
      for ( const value of Object.values(obj.instance_) ) {
        if ( this.isFObject(value) ) {
          this.addListeners(value);
        }
      }
      return;
    },

    function isFObject(obj) {
      if ( typeof obj === 'object' && obj.instance_ ) {
        return true;
      }
    }
  ],

  listeners: [
    {
      name: 'updateWizardlet',
      code: function() {
        // TODO: can we only update the wizardlet that has new data instead of updating all the wizardlets?
        // TODO: when/where do we call finalOnClose?
        for ( const wizardlet of this.wizardlets ) {
          try {
            wizardlet.save();
          } catch (err) {
            this.notify(err.message, '', this.LogLevel.ERROR, true);
          }
        }
      }
    }
  ]
});
