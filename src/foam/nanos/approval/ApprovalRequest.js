/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'ApprovalRequest',
  documentation: 'Approval requests are stored in approvalRequestDAO and' +
  'represent a single approval request for a single user.',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  javaImports: [
    'foam.core.X',
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

  topics: [
    'finished',
    'throwError'
  ],

  requires: [
    'foam.dao.AbstractDAO',
    'foam.nanos.approval.ApprovalStatus',
    'foam.u2.dialog.NotificationMessage'
  ],

  imports: [
    'approvalRequestDAO',
    'ctrl',
    'currentMenu',
    'stack',
    'user'
  ],

  tableColumns: [
    'id',
    'description',
    'classification',
    'objId',
    'approver',
    'status',
    'memo'
  ],

  sections: [
    {
      name: 'basicInformation',
      permissionRequired: true
    },
    {
      name: 'requestDetails'
    },
    {
      name: 'supportDetails'
    },
    {
      name: '_defaultSection',
      permissionRequired: true
    }
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
      label: 'Cancelled',
      predicateFactory: function(e) {
        return  e.EQ(
          foam.nanos.approval.ApprovalRequest.STATUS,
          foam.nanos.approval.ApprovalStatus.CANCELLED
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
      class: 'Long',
      name: 'id',
      section: '_defaultSection',
      visibility: 'RO',
      documentation: 'Sequence number.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'approver',
      section: 'requestDetails',
      documentation: `The user that is requested for approval. When set, "group" property is ignored.`,
      view: function(_, X) {
        let slot = foam.core.SimpleSlot.create();
        let data = X.data;
        let approver = data.approver;

        X.userDAO.find(approver).then(user => {
          if ( data.status != foam.nanos.approval.ApprovalStatus.REQUESTED ) {
            slot.set(user ? user.toSummary() : `User #${approver}`);	
          } else if ( user ) {
            if ( X.user.id == user.id ) {
              slot.set(user.toSummary());
            } else {
              slot.set(user.group);
            }
          } else {
            slot.set(data.REQUESTED);
          }
        });
        
        return {
          class: 'foam.u2.view.ValueView',
          data$: slot
        };
      },
      tableCellFormatter: function(approver, data) {
        let self = this;
        this.__subSubContext__.userDAO.find(approver).then(user => {
          if ( data.status != foam.nanos.approval.ApprovalStatus.REQUESTED ) {
            self.add(user ? user.toSummary() : `User #${approver}`);
          } else if ( user ) {
            if ( self.__subSubContext__.user.id == user.id ) {
              self.add(user.toSummary());
            } else {
              self.add(user.group);
            }
          } else {
            self.add(data.REQUESTED);
          }
        });
      },
      visibility: 'RO'
    },
    {
      class: 'Object',
      javaType: 'Object',
      name: 'objId',
      documentation: 'id of the object that needs approval.',
      tableWidth: 150,
      tableCellFormatter: function(objId) {
        let self = this;
        var userId = parseInt(objId);
        if ( !! userId ) {
          this.__subSubContext__.userDAO.find(userId).then(function(a) {

          if ( a != undefined ) {
            self.add(a.toSummary());
          } else {
            self.add(objId);
          }
          }).catch(function(err) {
            self.add(objId);
          });
        }
      }
    },
    {
      class: 'String',
      name: 'daoKey',
      documentation: `Used internally in approvalDAO to point where requested object can be found.
      Should not be used to retrieve approval requests for a given objects
      since an object can have multiple requests of different nature.`
    },
    {
      class: 'String',
      name: 'classification',
      label: 'Approval Type',
      section: 'requestDetails',
      tableWidth: 150,
      documentation: `Should be unique to a certain type of requests and created within a single rule.
      For example "IdentityMind Business approval".
      When retrieving approval requests from a dao, do not use daoKey, use classification instead:
      mlang.AND(
        EQ(ApprovalRequest.OBJ_ID, objectId),
        EQ(ApprovalRequest.REQUEST_REFERENCE, "reference")
      )`,
      gridColumns: 4,
      visibility: function(classification) {
        return classification ?
          'RO' :
          'HIDDEN';
      }
    },
    {
      class: 'Int',
      name: 'points',
      documentation: `Specific to each ApprovalRequest object.
      Determines the weight of the approved request depending on the approver's role.
      Future: populated in approvalRequestDAO pipeline based on configurations.
      Currentely populated as 1.`,
      gridColumns: 4,
      section: 'basicInformation',
      visibility: function(points) {
        return points ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Int',
      name: 'requiredPoints',
      value: 1,
      gridColumns: 4,
      section: 'basicInformation',
      documentation: `Defines how many approvers required and approvers' ranks.
      E.g. when set to 10:
      1) 10 approval requests with "points" set to 1.
      2) 2 approval requests with "points" set to 3 and 1 approval request with "points" set to 5.
      etc.
      Deafults to 1 meaning only one approval of any approver rank is required by default.`,
      visibility: function(requiredPoints) {
        return requiredPoints ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Int',
      name: 'requiredRejectedPoints',
      value: 1,
      gridColumns: 4,
      section: 'basicInformation',
      visibility: function(requiredRejectedPoints) {
        return requiredRejectedPoints ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Group',
      name: 'group',
      documentation: `When set, each user in the group will receive a request for approval.
      If "approver" property is set, "group" property is ignored.`,
      section: 'supportDetails',
      visibility: function(group) {
        return group ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Enum',
      of: 'foam.nanos.approval.ApprovalStatus',
      name: 'status',
      value: 'REQUESTED',
      section: 'requestDetails',
      javaFactory: 'return foam.nanos.approval.ApprovalStatus.REQUESTED;',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'memo',
      view: { class: 'foam.u2.tag.TextArea', rows: 5, cols: 80 },
      documentation: 'Meant to be used for explanation on why request was approved/rejected',
      section: 'supportDetails',
      visibility: function(memo, status) {
        if ( status == foam.nanos.approval.ApprovalStatus.REQUESTED ) {
          return foam.u2.DisplayMode.RW;
        } else if ( memo ) {
          return foam.u2.DisplayMode.R0;
        } else {
          return foam.u2.DisplayMode.HIDDEN;
        }
      }
    },
    {
      class: 'String',
      name: 'description',
      documentation: `Approval request description.`,
      tableWidth: 200,
      section: 'requestDetails',
      visibility: function(description) {
        return description ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'String',
      name: 'token',
      documentation: 'token in email for ‘click to approve’.',
      section: 'basicInformation',
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      class: 'DateTime',
      name: 'created',
      section: 'supportDetails',
      gridColumns: 6,
      visibility: function(created) {
        return created ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      gridColumns: 6,
      section: 'supportDetails',
      visibility: function(lastModified) {
        return lastModified ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      section: 'supportDetails',
      tableCellFormatter: function(initiatingUser) {
        let self = this;
        this.__subSubContext__.userDAO.find(initiatingUser).then(user => {
          self.add(user ? user.toSummary() : `User #${initiatingUser}`);
        });
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      section: 'supportDetails',
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      section: 'supportDetails',
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      class: 'String',
      name: 'refObj',
      transient: true,
      expression: function(daoKey, objId) {
        return daoKey + ':' + objId;
      },
      javaGetter: `
        return getDaoKey() + ": " + getObjId();
      `,
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      class: 'String',
      name: 'daoKey_',
      readPermissionRequired: true,
      writePermissionRequired: true,
      factory: function(o, n) {
        var key = this.daoKey;
        var X = this.ctrl.__subContext__;

        if ( ! X[key] ) {
          if ( key.startsWith('local') ) {
            key = key.replace('local', '');
            key = key.charAt(0).toLowerCase() + key.slice(1);
          }
        }
        return key;
      }
    },
    {
      class: 'Boolean',
      name: 'isTrackingRequest',
      value: false
    },
    {
      class: 'Boolean',
      name: 'isFulfilled',
      visibility: 'HIDDEN'
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
      class: 'String',
      name: 'approvableHashKey',
      hidden: true
    }
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
      name: 'SUCCESS_CANCELLED',
      message: 'You have successfully cancelled this request.'
    },
    {
      name: 'REQUESTED',
      message: 'Pending'
    }
  ],

  methods: [
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
    {
      name: 'toSummary',
      code: function() {
        return `(${this.classification}) ${this.operation}`;
      }
    }
  ],

  actions: [
    {
      name: 'approve',
      section: 'requestDetails',
      isAvailable: (isTrackingRequest, status) => {
        if (
          status === foam.nanos.approval.ApprovalStatus.REJECTED ||
          status === foam.nanos.approval.ApprovalStatus.APPROVED ||
          status === foam.nanos.approval.ApprovalStatus.CANCELLED
        ) {
          return false;
        }
        return ! isTrackingRequest;
      },
      code: function(X) {
        var approvedApprovalRequest = this.clone();
        approvedApprovalRequest.status = this.ApprovalStatus.APPROVED;

        X.approvalRequestDAO.put(approvedApprovalRequest).then(o => {
          X.approvalRequestDAO.cmd(this.AbstractDAO.RESET_CMD);
          this.finished.pub();
          X.ctrl.add(this.NotificationMessage.create({
            message: this.SUCCESS_APPROVED
          }));

          if ( X.currentMenu.id !== X.stack.top[2] ) {
            X.stack.back();
          }
        }, e => {
          this.throwError.pub(e);
          X.ctrl.add(this.NotificationMessage.create({
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
          status === foam.nanos.approval.ApprovalStatus.APPROVED ||
          status === foam.nanos.approval.ApprovalStatus.CANCELLED
        ) {
          return false;
        }
        return ! isTrackingRequest;
      },
      code: function(X) {
        var rejectedApprovalRequest = this.clone();
        rejectedApprovalRequest.status = this.ApprovalStatus.REJECTED;

        X.approvalRequestDAO.put(rejectedApprovalRequest).then(o => {
          X.approvalRequestDAO.cmd(this.AbstractDAO.RESET_CMD);
          this.finished.pub();
          X.ctrl.add(this.NotificationMessage.create({
            message: this.SUCCESS_REJECTED
          }));

          if ( X.currentMenu.id !== X.stack.top[2] ) {
            X.stack.back();
          }
        }, e => {
          this.throwError.pub(e);
          X.ctrl.add(this.NotificationMessage.create({
            message: e.message,
            type: 'error'
          }));
        });
      }
    },
    {
      name: 'cancel',
      section: 'requestDetails',
      isAvailable: (isTrackingRequest, status) => {
        if (
          status === foam.nanos.approval.ApprovalStatus.REJECTED ||
          status === foam.nanos.approval.ApprovalStatus.APPROVED ||
          status === foam.nanos.approval.ApprovalStatus.CANCELLED
        ) {
          return false;
        }
        return isTrackingRequest;
      },
      code: function(X) {
        var cancelledApprovalRequest = this.clone();
        cancelledApprovalRequest.status = this.ApprovalStatus.CANCELLED;

        X.approvalRequestDAO.put(cancelledApprovalRequest).then(o => {
          X.approvalRequestDAO.cmd(this.AbstractDAO.RESET_CMD);
          this.finished.pub();
          X.ctrl.add(this.NotificationMessage.create({
            message: this.SUCCESS_CANCELLED
          }));

          if ( X.currentMenu.id !== X.stack.top[2] ) {
            X.stack.back();
          }
        }, e => {
          this.throwError.pub(e);
          X.ctrl.add(this.NotificationMessage.create({
            message: e.message,
            type: 'error'
          }));
        });
      }
    },
    {
      name: 'viewReference',
      isDefault: true,
      isAvailable: function() {
        var self = this;

        // TODO: To consider in new approval system rework: should we allow people to view reference for a deleted or rejected object
        // since it will now just be stored in the approvable dao
        // Do not show the action if the request was reject or approved and removed
        if (self.status == foam.nanos.approval.ApprovalStatus.REJECTED ||
           (self.status == foam.nanos.approval.ApprovalStatus.APPROVED && self.operation == foam.nanos.ruler.Operations.REMOVE)) {
             return false;
        }
        
        if ( self.__subContext__[self.daoKey_] ) {
          var property = self.__subContext__[self.daoKey_].of.ID;
          var objId = property.adapt.call(property, self.objId, self.objId, property);
          return self.__subContext__[this.daoKey_]
            .find(objId)
            .then((obj) => {
              return !! obj;
            })
            .catch((err) => {
              console.warn(err.message || err);
              return false;
            });
          }
      },
      code: function(X) {
        var self = this;

        // This should already be filtered out by the isAvailable, but adding here as duplicate protection
        if (self.status == foam.nanos.approval.ApprovalStatus.REJECTED ||
           (self.status == foam.nanos.approval.ApprovalStatus.APPROVED && self.operation == foam.nanos.ruler.Operations.REMOVE)) {
             console.warn('Object is inaccessible')
             return;
        }

        var objId = X[self.daoKey_].of.ID.type === 'Long' ? parseInt(this.objId) : this.objId;

        return X[this.daoKey_]
          .find(objId)
          .then((obj) => {
            // If the dif of objects is calculated and stored in Map(obj.propertiesToUpdate),
            // this is for updating object approvals
            if ( obj.propertiesToUpdate ) {
              // then here we created custom view to display these properties
              X.stack.push({
                class: 'foam.nanos.approval.PropertiesToUpdateView',
                propObject: obj.propertiesToUpdate,
                objId: obj.objId,
                daoKey: obj.daoKey,
                title: 'Updated Properties and Changes'
              });
              return;
            }

            // else pass general view with modeled data for display
            // this is for create, deleting object approvals
            X.stack.push({
              class: 'foam.comics.v2.DAOSummaryView',
              data: obj,
              of: obj.cls_,
              config: foam.comics.v2.DAOControllerConfig.create({
                daoKey: this.daoKey_,
                of: obj.cls_,
                editEnabled: false,
                createEnabled: false,
                deleteEnabled: false
              })
            });
          })
          .catch((err) => {
            console.warn(err.message || err);
          });
      },
      tableWidth: 100
    }
  ]
});
