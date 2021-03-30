/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'MinMaxCapabilityWizardlet',
  extends: 'foam.nanos.crunch.ui.CapabilityWizardlet',
  implements: [ 'foam.nanos.crunch.ui.PrerequisiteAwareWizardlet' ],

  requires: [
    'foam.u2.view.MultiChoiceView',
    'foam.u2.view.CardSelectView',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.ui.MinMaxCapabilityWizardletSection'
  ],

  imports: [
    'translationService',
    'capabilityDAO'
  ],

  properties: [
    {
      name: 'data',
      flags: ['web'],
      factory: function(){
        return foam.nanos.crunch.MinMaxCapabilityData.create();
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.u2.wizard.Wizardlet',
      name: 'choiceWizardlets',
      factory: function() {
        return [];
      }
    },
    {
      name: 'min',
      class: 'Int',
      factory: function(){
        if ( foam.nanos.crunch.MinMaxCapability.isInstance(this.capability) ){
          // a capability min of 0 denotes no minimum limit
          return this.capability.min > 0 ? this.capability.min : this.choices.length;
        }
      }
    },
    {
      name: 'max',
      class: 'Int',
      factory: function(){
        if ( foam.nanos.crunch.MinMaxCapability.isInstance(this.capability) ){
          return this.capability.max;
        }
      }
    },
    {
      name: 'choices',
      expression: function(choiceWizardlets){
        var self = this;
        return choiceWizardlets.map(wizardlet => {
          var isFinal =
            wizardlet.status === this.CapabilityJunctionStatus.GRANTED ||
            wizardlet.status === this.CapabilityJunctionStatus.PENDING;

          return [wizardlet.capability, self.translationService.getTranslation(foam.locale, `${wizardlet.capability.id}.name`,wizardlet.title), isFinal]
        })
      }
    },
    {
      class: 'Boolean',
      name: 'isValid',
      value: false
    },
    {
      class: 'Boolean',
      name: 'isVisible',
      expression: function (isAvailable, choices, hideChoiceView) {
        return isAvailable && choices.length > 0 && ! hideChoiceView;
      }
    },
    {
      name: 'isAvailable',
      class: 'Boolean',
      value: true,
      documentation: `
        Specify the availability of this wizardlet. If true, wizardlet is
        available if at least one section is available. If false, wizardlet
        does not display even if some sections are available.
      `,
      postSet: function(_,n){
        if ( !n ){
          this.selectedData = [];

          // to cascade hiding all descendent wizardlets
          // TODO: investigate why this is still needed,
          // setting data to empty array should have made isAvailable automatically evaluate to false
          this.choiceWizardlets.forEach(cw => {
            cw.isAvailable = false
          });

          this.isAvailablePromise =
            Promise.all(this.choiceWizardlets.map(cw => cw.isAvailablePromise))
              .then(() => { this.cancel(); });
        } else {
          this.save();
        }
      }
    },
    {
      name: 'selectedData',
      postSet: function(_,n){
        this.data.selectedData = n.map(capability => capability.id);
      }
    },
    {
      name: 'sections',
      flags: ['web'],
      transient: true,
      class: 'FObjectArray',
      of: 'foam.u2.wizard.WizardletSection',
      factory: function() {
        // to account for isFinal: true in choices
        var finalData = this.choices.filter(choice => choice[2]).map(selectedChoice => selectedChoice[0]);
        var selectedData = finalData;

        // to account for previously selected data
        if ( this.data.selectedData.length > 0 ){
          var savedSelectedDataIds = [
            ...this.data.selectedData
          ];

          var savedSelectedData = [];

          // need to grab the selected capability objects
          for ( let i = 0; i < this.choices.length; i++ ){
            if ( savedSelectedDataIds.includes(this.choices[i][0].id) ){
              savedSelectedData.push(this.choices[i][0]);
            }

            if ( savedSelectedData.length === savedSelectedDataIds.length ) break;
          }

          selectedData = finalData.concat(savedSelectedData);
        }

        this.selectedData = selectedData;

        var sections = [
          this.MinMaxCapabilityWizardletSection.create({
            isAvailable: true,
            title: this.capability.name,
            choiceWizardlets$: this.choiceWizardlets$,
            isLoaded: true,
            customView: {
              class: 'foam.u2.view.MultiChoiceView',
              choices$: this.choices$,
              isValidNumberOfChoices$: this.isValid$,
              showValidNumberOfChoicesHelper: false,
              data$: this.selectedData$,
              minSelected$: this.min$,
              maxSelected$: this.max$
            }
          })
        ];

        if ( this.of && this.showDefaultSections ){
          var ofSections = foam.u2.detail.AbstractSectionedDetailView.create({
            of: this.of,
          }, this).sections.map(section => this.WizardletSection.create({
            section: section,
            data$: this.data$,
            isAvailable$: section.createIsAvailableFor(
              this.data$,
            )
          }));

          sections = [
            ...ofSections,
            ...sections
          ]
        }
        return this.hideChoiceView ? [] : sections;
      }
    },
    {
      name: 'consumePrerequisites',
      documentation: `
        When true, report 'true' on calls to addPrerequisite to indicate that
        prerequisite wizardlets were handled by this wizardlet. This effectively
        prevents prerequisite wizardlets from displaying in a CRUNCH wizard.
      `,
      class: 'Boolean'
    },
    {
      name: 'hideChoiceView',
      documentation: `
        When true, do not display the choice selection section.
      `,
      class: 'Boolean'
    },
    {
      name: 'showDefaultSections',
      class: 'Boolean'
    }
  ],

  methods: [
    function addPrerequisite(wizardlet) {
      wizardlet.isAvailable = false;
      this.choiceWizardlets.push(wizardlet);
      return this.consumePrerequisites;
    }
  ]
});
