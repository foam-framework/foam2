/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'AgentCapabilityJunctionDAOSummaryView',
  extends: 'foam.comics.v2.DAOSummaryView',

  imports: [
    'auth',
    'crunchController',
    'userDAO',
    'stack',
    'notify'
  ],

  messages: [
    { name: 'SUCCESS_UPDATED', message: 'Successfuly updated onboarding information.'},
    { name: 'SUCCESS_REMOVED', message: 'Successfuly removed onboarding information. Please wait for resubmission.'},
  ],

  css: `
    ^ {
      padding-bottom: 0px !important;
    }
    ^view-container .foam-u2-stack-StackView {
      padding-left: 0px !important;
    }
    ^ .foam-u2-wizard-ScrollingStepWizardView-hide-X-status {
      padding-top: 0px !important;
    }
    ^ .foam-u2-wizard-ScrollingStepWizardView-hide-X-entry {
      padding-top: 0px !important;
    }
    ^ .foam-u2-wizard-ScrollingStepWizardView-fix-grid {
      height: calc(100vh - 221px) !important;
    }
    ^ .foam-u2-detail-SectionView-backOfficeSuggestedUserTransactionInfo {
      display: none;
    }
  `,

  classes: [
    {
      name: 'ScrollingWizardStackView',
      extends: 'foam.u2.View',
      imports: [
        'crunchController',
        'userDAO'
      ],
      requires: [
        'foam.u2.crunch.wizardflow.SaveAllAgent'
      ],

      properties: [
        'ucj',
        {
          class: 'Function',
          name: 'onSave'
        }
      ],
      methods: [
        async function initE() {          
          var user = await this.userDAO.find(this.ucj.effectiveUser);
          var realUser = await this.userDAO.find(this.ucj.sourceId);
          var subject = foam.nanos.auth.Subject.create({ user: user, realUser: realUser });
          var stack = foam.u2.stack.Stack.create();
          var x = this.__subContext__.createSubContext({ stack: stack, subject: subject, controllerMode: foam.u2.ControllerMode.EDIT });
          
          this.crunchController.createWizardSequence(this.ucj.targetId, x)
            .reconfigure('LoadCapabilitiesAgent', {
              subject: subject })
            .reconfigure('LoadWizardletsAgent', {
              subject: subject })
            .reconfigure('ConfigureFlowAgent', {
              popupMode: false
            })
            .remove('RequirementsPreviewAgent')
            .remove('SkipGrantedAgent')
            .remove('AutoSaveWizardletsAgent')
            .remove('PutFinalJunctionsAgent')
            .add(this.SaveAllAgent, { onSave: this.onSave })
            .execute();

          this.tag(foam.u2.stack.StackView.create({ data: stack, showActions: false }, x));
        }
      ]
    }
  ],

  properties: [
    {
      class: 'foam.u2.ViewSpecWithJava',
      name: 'viewView',
      factory: function() {
        let onSave = (isValid) => {
          this.stack.back();
          this.notify(isValid ? this.SUCCESS_UPDATED : this.SUCCESS_REMOVED, '', foam.log.LogLevel.INFO, true);
        }
        return this.ScrollingWizardStackView.create({ ucj: this.data, onSave: onSave });
      }
    }
  ]
});