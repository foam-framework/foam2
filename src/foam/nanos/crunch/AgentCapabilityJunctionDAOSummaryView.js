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
    'notify',
    'stack'
  ],

  requires: [
    'foam.dao.AbstractDAO',
    'foam.log.LogLevel',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalStatus'
  ],

  messages: [
    { name: 'BACK_LABEL_ACJ', message: 'Back' },
    { name: 'SUCCESS_UPDATED', message: 'Successfuly updated onboarding information.'},
    { name: 'SUCCESS_REMOVED', message: 'Successfuly removed onboarding information.'}
  ],

  css: `
    ^ {
      padding-bottom: 0px !important;
    }
    ^view-container .foam-u2-stack-StackView {
      padding-left: 0px !important;
    }
    ^ .foam-u2-wizard-ScrollingStepWizardView-fix-grid {
      height: calc(100vh - 221px) !important;
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
        'foam.nanos.auth.Subject',
        'foam.u2.ControllerMode',
        'foam.u2.crunch.wizardflow.SaveAllAgent',
        'foam.u2.stack.Stack',
        'foam.u2.stack.StackView'
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
          var subject = this.Subject.create({ user: user, realUser: realUser });
          var stack = this.Stack.create();
          var x = this.__subContext__.createSubContext({ stack: stack, subject: subject, controllerMode: this.ControllerMode.EDIT });
          
          this.crunchController.createWizardSequence(this.ucj.targetId, x)
            .reconfigure('LoadCapabilitiesAgent', {
              subject: subject })
            .reconfigure('ConfigureFlowAgent', {
              popupMode: false
            })
            .remove('RequirementsPreviewAgent')
            .remove('SkipGrantedAgent')
            .remove('WizardStateAgent')
            .remove('AutoSaveWizardletsAgent')
            .remove('PutFinalJunctionsAgent')
            .add(this.SaveAllAgent, { onSave: this.onSave })
            .execute();

          this.tag(this.StackView.create({ data: stack, showActions: false }, x));
        }
      ]
    }
  ],

  properties: [
    {
      name: 'backLabel',
      factory: function() {
        return this.BACK_LABEL_ACJ;
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'viewView',
      factory: function() {
        let onSave = async (isValid, ucj) => {
          this.notify(isValid ? this.SUCCESS_UPDATED : this.SUCCESS_REMOVED, '', this.LogLevel.INFO, true);
          this.stack.back();
        }
        return this.ScrollingWizardStackView.create({ ucj: this.data, onSave: onSave });
      }
    }
  ]
});