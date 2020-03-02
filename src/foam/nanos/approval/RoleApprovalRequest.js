/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'RoleApprovalRequest',
  extends: 'foam.nanos.approval.ApprovalRequest',

  javaImports : [
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.*',
    'foam.nanos.logger.Logger',
    'foam.nanos.ruler.Operations',
    'java.util.ArrayList',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  tableColumns: [
    'classification',
    'operation',
    'initiatingUser',
    'approver',
    'status',
    'lastModified'
  ],

  topics: [
    'finished',
    'throwError'
  ],

  imports: [
    'currentMenu',
    'stack',
    'user'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],

  axioms: [
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Pending',
      predicateFactory: function(e) {
        return e.EQ(
          foam.nanos.approval.ApprovalRequest.STATUS,
          foam.nanos.approval.ApprovalStatus.REQUESTED
        );
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Approved',
      predicateFactory: function(e) {
        return  e.EQ(
          foam.nanos.approval.ApprovalRequest.STATUS,
          foam.nanos.approval.ApprovalStatus.APPROVED
        );
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Rejected',
      predicateFactory: function(e) {
        return  e.EQ(
          foam.nanos.approval.ApprovalRequest.STATUS,
          foam.nanos.approval.ApprovalStatus.REJECTED
        );
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'All',
      predicateFactory: function(e) {
        return e.TRUE;
      }
    },
    {
      class: 'foam.comics.v2.namedViews.NamedViewCollection',
      name: 'Table',
      view: { class: 'foam.comics.v2.DAOBrowserView' },
      icon: 'images/list-view.svg',
    }
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'approver',
      section: 'requestDetails',
      documentation: `The user that is requested for approval. When set, "group" property is ignored.`,
      view: function(_, X) {
        if ( X.data.status === foam.nanos.approval.ApprovalStatus.REQUESTED ) {
          return {
            class: 'foam.u2.view.ValueView',
            data$: X.data$.map((data) => data.REQUESTED)
          };
        } else {
          return { class: 'foam.u2.view.ReferencePropertyView' };
        }
      },
      tableCellFormatter: function(approver, data) {
        let self = this;
        // If request is REQUESTED, show as Pending
        // Otherwise, show approver's name
        if ( data.status === foam.nanos.approval.ApprovalStatus.REQUESTED ) {
          this.add(data.REQUESTED);
        } else {
          this.__subSubContext__.userDAO.find(approver).then(user => {
            self.add(user ? user.toSummary() : `User #${approver}`);
          });
        }
      },
      visibility: function(status) {
        if ( status === foam.nanos.approval.ApprovalStatus.REQUESTED ) {
          return foam.u2.DisplayMode.HIDDEN;
        }

        return foam.u2.DisplayMode.RO;
      }
    },
    {
      class: 'String',
      name: 'pendingApproval',
      label: 'Approver',
      section: 'requestDetails',
      transient: true,
      value: 'Pending',
      visibility: function(status) {
        if ( status === foam.nanos.approval.ApprovalStatus.REQUESTED ) {
          return foam.u2.DisplayMode.RO;
        }
        return foam.u2.DisplayMode.HIDDEN;
      },
      documentation: `
        This string will be used to show that the approver is pending without
        altering the value of Approver. It is also transient.
      `
    },
    {
      class: 'Enum',
      of: 'foam.nanos.ruler.Operations',
      name: 'operation',
      label: 'Action',
      section: 'requestDetails',
      visibility: function(operation) {
        return operation ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'initiatingUser',
      label: 'Requestor',
      tableCellFormatter: function(initiatingUser) {
        let self = this;
        this.__subSubContext__.userDAO.find(initiatingUser).then(user => {
          self.add(user ? user.toSummary() : `User #${initiatingUser}`);
        });
      },
      section: 'requestDetails',
      visibility: function(initiatingUser) {
        return initiatingUser ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Boolean',
      name: 'isFulfilled',
      visibility: 'HIDDEN'
    }
  ],

  methods: [
    {
      name: 'toSummary',
      code: function() {
        return `(${this.classification}) ${this.operation}`;
      }
    },
    {
      name: 'validate',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      Logger logger = (Logger) x.get("logger");
      DAO dao = (DAO) x.get(getDaoKey());
      if ( dao == null ) {
        logger.error(this.getClass().getSimpleName(), "DaoKey not found", getDaoKey());
        throw new RuntimeException("Invalid dao key for the approval request object.");
      }

      if ( getOperation() != Operations.CREATE ){
        FObject obj = dao.inX(x).find(getObjId());
        if ( obj == null ) {
          logger.error(this.getClass().getSimpleName(), "ObjId not found", getObjId());
          throw new RuntimeException("Invalid object id.");
        }
      }
      `
    },
  ],

  messages: [
    {
      name: 'SUCCESS_APPROVED',
      message: 'You have successfully approved this request.'
    },
    {
      name: 'SUCCESS_REJECTED',
      message: 'You have successfully rejected this request.'
    },
    {
      name: 'REQUESTED',
      message: 'Pending'
    }
  ],

  actions: [
    {
      name: 'approve',
      section: 'requestDetails',
      isAvailable: (isTrackingRequest, status) => {
        if (
          status === foam.nanos.approval.ApprovalStatus.REJECTED ||
          status === foam.nanos.approval.ApprovalStatus.APPROVED
        ) {
          return false;
        }
        return ! isTrackingRequest;
      },
      code: function() {
        var approvedApprovalRequest = this.clone();
        approvedApprovalRequest.status = this.ApprovalStatus.APPROVED;

        this.approvalRequestDAO.put(approvedApprovalRequest).then(o => {
          this.approvalRequestDAO.cmd(this.AbstractDAO.RESET_CMD);
          this.finished.pub();
          this.ctrl.add(this.NotificationMessage.create({
            message: this.SUCCESS_APPROVED
          }));

          if ( this.currentMenu.id !== this.stack.top[2] ) {
            this.stack.back();
          }
        }, e => {
          this.throwError.pub(e);
          this.ctrl.add(this.NotificationMessage.create({
            message: e.message,
            type: 'error'
          }));
        });
      }
    },
    {
      name: 'reject',
      section: 'requestDetails',
      isAvailable: (isTrackingRequest, status) => {
        if (
          status === foam.nanos.approval.ApprovalStatus.REJECTED ||
          status === foam.nanos.approval.ApprovalStatus.APPROVED
        ) {
          return false;
        }
        return ! isTrackingRequest;
      },
      code: function() {
        var rejectedApprovalRequest = this.clone();
        rejectedApprovalRequest.status = this.ApprovalStatus.REJECTED;

        this.approvalRequestDAO.put(rejectedApprovalRequest).then(o => {
          this.approvalRequestDAO.cmd(this.AbstractDAO.RESET_CMD);
          this.finished.pub();
          this.ctrl.add(this.NotificationMessage.create({
            message: this.SUCCESS_REJECTED
          }));

          if ( this.currentMenu.id !== this.stack.top[2] ) {
            this.stack.back();
          }
        }, e => {
          this.throwError.pub(e);
          this.ctrl.add(this.NotificationMessage.create({
            message: e.message,
            type: 'error'
          }));
        });
      }
    }
  ]
});
