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
      name: 'daoKey',
      expression: function (capability) {
        return capability.daoKey
      }
    },
    {
      name: 'daoFindKey',
      expression: function (capability) {
        return capability.daoFindKey
      }
    },
    {
      name: 'ofSections',
      factory: null,
      expression: function(of) {
        let listOfSectionAxiomsFromClass = of.getAxiomsByClass(this.SectionAxiom);
        var listOfSectionsFromClass = listOfSectionAxiomsFromClass
          .sort((a, b) => a.order - b.order)
          .map((a) => this.Section.create().fromSectionAxiom(a, of));
        let unSectionedPropertiesSection = this.checkForUnusedProperties(listOfSectionsFromClass, of); // this also will handle models with no sections
        if ( unSectionedPropertiesSection )
          listOfSectionsFromClass.push(unSectionedPropertiesSection);
        return listOfSectionsFromClass;
      }
    },
    {
      name: 'data',
      factory: function () {
        if ( this.ucj === null ) {
          return this.of.create({}, this);
        }
        return this.ucj.data;
      }
    }
  ],

  actions: [
    {
      name: 'save',
      code: function() {
        this.updateUCJ().then(() => {
          var ucj = this.ucj;
          if ( ucj === null ) {
            ucj = this.UserCapabilityJunction.create({
              sourceId: this.user.id,
              targetId: this.capability.id
            })
          }
          ucj.data = this.data;
          return this.userCapabilityJunctionDAO.put(ucj);
        });
      }
    },
  ],

  methods: [
    {
      name: 'checkForUnusedProperties',
      code: function(sections, of) {
        var usedAxioms = sections
          .map((s) => s.properties.concat(s.actions))
          .flat()
          .reduce((map, a) => {
            map[a.name] = true;
            return map;
          }, {});
        var unusedProperties = of.getAxiomsByClass(this.Property)
          .filter((p) => ! usedAxioms[p.name])
          .filter((p) => ! p.hidden);
        var unusedActions = of.getAxiomsByClass(this.Action)
          .filter((a) => ! usedAxioms[a.name]);

        if ( unusedProperties.length || unusedActions.length ) {
          return this.Section.create({
            properties: unusedProperties,
            actions: unusedActions
          });
        }
        return undefined;
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
