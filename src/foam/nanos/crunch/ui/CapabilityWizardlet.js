/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'CapabilityWizardlet',
  extends: 'foam.u2.wizard.BaseWizardlet',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'crunchController',
    'localeDAO'
  ],

  properties: [
    // Properties specific to CapabilityWizardSection
    {
      name: 'capability',
      postSet: function() {
        var self = this;
        return this.localeDAO.where(
          this.AND(
            this.OR(
              this.EQ(foam.i18n.Locale.LOCALE, foam.locale),
              this.EQ(foam.i18n.Locale.LOCALE, foam.locale.substring(0,foam.locale.indexOf('-')))),
            this.EQ(foam.i18n.Locale.ID, this.capability.id + '.name')))
        .select().then(function(a){
          let arr = a.array;
          if ( arr.length > 0 ) {
            let ea = arr[0];
            self.title = ea.target;
          } else 
            self.title = self.capability.name;
        })
        .catch(function() {
          self.title = self.capability.name;
        });
      }
    },
    {
      name: 'ucj'
    },

    // Properties for WizardSection interface
    {
      name: 'of',
      class: 'Class',
      expression: function(capability) {
        if ( ! capability || ! capability.of ) return null;
        return capability.of;
      }
    },
    {
      name: 'data',
      flags: ['web'],
      factory: function() {
        if ( ! this.of ) return null;

        var ret = this.of.getAxiomByName('capability') ?
          this.of.create({ capability: this.capability }, this) :
          this.of.create({}, this);

        if ( this.ucj === null ) return ret;

        ret = Object.assign(ret, this.ucj.data);
        return ret;
      }
    },
    {
      name: 'title',
      class: 'String',
    }
  ],

  methods: [
    {
      name: 'save',
      code: function() {
        return this.crunchController && this.crunchController.save(this);
      }
    }
  ]
});
