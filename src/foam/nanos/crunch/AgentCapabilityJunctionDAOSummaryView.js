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
    'approvalRequestDAO',
    'auth',
    'crunchController',
    'notify',
    'pushMenu',
    'stack',
    'userDAO'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.dao.AbstractDAO',
    'foam.log.LogLevel',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalStatus'
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

          this.tag(this.StackView.create({ data: stack, showActions: false }, x));
        }
      ]
    }
  ],

  properties: [
    {
      class: 'foam.u2.ViewSpecWithJava',
      name: 'viewView',
      factory: function() {
        let onSave = async (isValid, ucj) => {
          if ( isValid ) {
            this.notify(this.SUCCESS_UPDATED, '', this.LogLevel.INFO, true);
            this.stack.back();
          }
          else {
            //TODO: need a better way to specify desired classification
            let approvals = await this.approvalRequestDAO.where(this.AND(
                this.EQ(this.ApprovalRequest.OBJ_ID, ucj.id),
                this.EQ(this.ApprovalRequest.DAO_KEY, "userCapabilityJunctionDAO"),
                this.EQ(this.ApprovalRequest.CLASSIFICATION, "Generic Business Validator"), 
                this.EQ(this.ApprovalRequest.STATUS, this.ApprovalStatus.REQUESTED)
              )).limit(1).select();
            let approval = approvals.array[0];
            if ( approval ) {
              let rejectedApproval = approval.clone();
              rejectedApproval.status = this.ApprovalStatus.REJECTED;
              rejectedApproval.memo = 'Outdated Approval.';
              this.approvalRequestDAO.put(rejectedApproval).then(o => {
                this.approvalRequestDAO.cmd(this.AbstractDAO.RESET_CMD);
                this.notify(this.SUCCESS_REMOVED, '', this.LogLevel.INFO, true);
                this.pushMenu('approvals', true);
              }, e => {
                this.notify(e.message, '', this.LogLevel.ERROR, true);
              });
            }
          }
        }
        return this.ScrollingWizardStackView.create({ ucj: this.data, onSave: onSave });
      }
    }
  ]
});