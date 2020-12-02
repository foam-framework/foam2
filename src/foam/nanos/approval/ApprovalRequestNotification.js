/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'ApprovalRequestNotification',
  extends: 'foam.nanos.notification.Notification',

  imports: [
    'foam.dao.DAO approvalRequestDAO'
  ],

  properties: [
    {
      name: 'approvalRequest',
      class: 'Reference',
      of: 'foam.nanos.approval.ApprovalRequest',
      view: function(_, X) {
        let slot = foam.core.SimpleSlot.create();
        let data = X.data;
        let approvalRequest = data.approvalRequest;

        X.approvalRequestDAO.find(approvalRequest).then(function(approval) {
          slot.set(approval.toSummary());
        });
        return {
          class: 'foam.u2.view.ValueView',
          data$: slot
        };
      }
    }
  ]
});
