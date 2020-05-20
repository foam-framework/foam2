foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'CapabilityWizardSection',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'user',
    'userCapabilityJunctionDAO'
  ],

  requires: [
    'foam.core.Action',
    'foam.core.Property',
    'foam.layout.Section',
    'foam.layout.SectionAxiom',
    'foam.nanos.crunch.UserCapabilityJunction',
  ],

  properties: [
    // Properties specific to CapabilityWizardSection
    {
      name: 'capability',
    },
    {
      name: 'ucj',
    },

    // Properties for WizardSection interface
    {
      name: 'of',
      class: 'Class',
      expression: function (capability) {
        return capability.of;
      }
    },
    {
      name: 'data',
      factory: function () {
        if ( ! this.of ) return null;

        var ret = this.of.create({}, this);
        if ( this.ucj === null ) return ret;
      
        ret = Object.assign(ret, this.ucj.data);
        return ret;
      }
    }
  ],

  methods: [
    {
      name: 'save',
      code: function() {
        return this.updateUCJ().then(() => {
          var ucj = this.ucj;
          if ( ucj === null ) {
            ucj = this.UserCapabilityJunction.create({
              sourceId: this.user.id,
              targetId: this.capability.id
            })
          }
          if ( this.of ) ucj.data = this.data;
          return this.userCapabilityJunctionDAO.put(ucj);
        });
      }
    },
    {
      // This can be moved to an expression on the 'data' property
      // iff property expressions unwrap promises.
      name: 'updateUCJ',
      async: true,
      code: function () {
        return this.userCapabilityJunctionDAO.find(
          this.AND(
            this.EQ(
              this.UserCapabilityJunction.SOURCE_ID,
              this.user.id),
            this.EQ(
              this.UserCapabilityJunction.TARGET_ID,
              this.capability.id))
        ).then(ucj => {
          this.ucj = ucj;
          return this;
        });
      }
    }
  ]
});
