/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'UCJView',
  extends: 'foam.u2.View',
  documentation: `
    Views the capability ID (in data) by fetching the UCJ associated with
    the subject in context and displaying it in READ mode.

    UCJView also provides an Edit action, which will present a popup
    allowing the user to make changes to the UCJ.

    This can be thought of as a view of a capability that is personalized
    to the user.
  `,

  imports: [
    'capabilityDAO',
    'crunchService',
    'crunchController',
  ],

  requires: [
    // CRUNCH agents
    'foam.u2.crunch.wizardflow.ConfigureFlowAgent',
    'foam.u2.crunch.wizardflow.CapabilityAdaptAgent',
    'foam.u2.crunch.wizardflow.LoadCapabilitiesAgent',
    'foam.u2.crunch.wizardflow.CreateWizardletsAgent',
    'foam.u2.crunch.wizardflow.LoadTopConfig',
    'foam.u2.crunch.wizardflow.StepWizardAgent',
    'foam.u2.crunch.wizardflow.PutFinalJunctionsAgent',

    'foam.u2.detail.SectionedDetailView',
    'foam.util.async.Sequence',
  ],

  properties: [
    {
      name: 'ucjData',
      class: 'FObjectProperty',
      of: 'FObject',
    }
  ],

  methods: [
    function initE() {
      this.update();
      this.SUPER();
      this
        .startContext({
          controllerMode: foam.u2.ControllerMode.VIEW
        })
          .tag(this.SectionedDetailView, {
            data$: this.ucjData$,
          })
        .endContext()
        .startContext({
          data: this,
        })
          .add(this.EDIT)
        .endContext()
        ;
    },
    function update() {
      this.capabilityDAO.find(this.data).then(cap => {
        var defaultData = cap.of.create({}, this);
        this.crunchService.getJunction(null, this.data).then(ucj => {
          if ( ucj && ucj.data ) {
            this.ucjData = ucj.data;
            return;
          }
          this.ucjData = defaultData;
        })
      });
    }
  ],

  actions: [
    function edit() {
      var crunchContext = this.__subContext__.createSubContext({
        rootCapability: this.data
      });
      // Invoke custom wizard flow which excludes pending check and preview
      this.Sequence.create(null, crunchContext)
        .add(this.ConfigureFlowAgent)
        .add(this.CapabilityAdaptAgent)
        .add(this.LoadCapabilitiesAgent)
        .add(this.CreateWizardletsAgent)
        .add(this.LoadTopConfig)
        .add(this.StepWizardAgent)
        .add(this.PutFinalJunctionsAgent)
        .execute()
        .then(() => {
          this.update();
        })
        .catch(err => {
          console.error(err);
        })
        ;
    }
  ],
});
