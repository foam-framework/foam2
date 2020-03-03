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
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger'
  ],

  requires: [
    'foam.dao.AbstractDAO',
    'foam.nanos.approval.ApprovalStatus'
  ],

  imports: [
    'approvalRequestDAO',
    'ctrl'
  ],

  tableColumns: [
    'id',
    'description',
    'classification',
    'objId',
    'viewReference',
    'approver',
    'status',
    'memo',
    'approve',
    'reject'
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
      tableCellFormatter: function(approver) {
        let self = this;
        this.__subSubContext__.userDAO.find(approver).then((user)=> {
          if ( user ) {
            if ( self.__subSubContext__.user.id == user.id ) {
              self.add(user.legalName);
            } else {
              self.add(user.group);
            }
          } else {
            self.add(approver);
          }
        });
      },
      visibility: function(approver) {
        return approver ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      },
    },
    {
      class: 'Object',
      javaType: 'Object',
      name: 'objId',
      writePermissionRequired: true,
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
      writePermissionRequired: true,
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
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
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
      readPermissionRequired: true,
      writePermissionRequired: true
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
        // FIXME: change to a better implementation
        if ( ! X[key] ) {
          // if DAO doesn't exist in context, change daoKey from localMyDAO
          // (server-side) to myDAO (accessible on front-end)
          key = key.substring(5, 6).toLowerCase() + key.substring(6);
        }
        return key;
      }
    },
    {
      name: 'referenceObj_',
      readPermissionRequired: true,
      writePermissionRequired: true,
      expression: function() {
        var X = this.ctrl.__subContext__;
        var objId = X[this.daoKey_].of.ID.type === 'Long' ? parseInt(this.objId) : this.objId;

        X[this.daoKey_]
          .find(objId)
          .then((obj) => {
            if (
              // if approvalRequest is rejected don't show ViewReference
              this.status === foam.nanos.approval.ApprovalStatus.REJECTED
              ||
              // if approvalRequest is for remove and has been either approved/rejected
              (this.status === foam.nanos.approval.ApprovalStatus.APPROVED
                &&
              this.operation === foam.nanos.ruler.Operations.REMOVE)
            ) {
              this.referenceObj_ = '';
              return;
            }
            this.referenceObj_ = obj;
          })
          .catch((err) => {
            console.warn(err.message || err);
          });
        return '';
      }
    },
    {
      class: 'Boolean',
      name: 'isTrackingRequest',
      value: false
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
      javaCode: `Logger logger = (Logger) x.get("logger");
DAO dao = (DAO) x.get(getDaoKey());
if ( dao == null ) {
  logger.error(this.getClass().getSimpleName(), "DaoKey not found", getDaoKey());
  throw new RuntimeException("Invalid dao key for the approval request object.");
}
FObject obj = dao.inX(x).find(getObjId());
if ( obj == null ) {
  logger.error(this.getClass().getSimpleName(), "ObjId not found", getObjId());
  throw new RuntimeException("Invalid object id.");
}
      `
    }
  ],

  actions: [
    {
      name: 'approve',
      label: 'Approve',
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
        this.status = this.ApprovalStatus.APPROVED;
        this.approvalRequestDAO.put(this);
        this.approvalRequestDAO.cmd(this.AbstractDAO.RESET_CMD);
      },
      tableWidth: 100
    },
    {
      name: 'reject',
      label: 'Reject',
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
        this.status = this.ApprovalStatus.REJECTED;
        this.approvalRequestDAO.put(this);
        this.approvalRequestDAO.cmd(this.AbstractDAO.RESET_CMD);
      },
      tableWidth: 100
    },
    {
      name: 'viewReference',
      isDefault: true,
      isAvailable: function(referenceObj_) {
        return !! referenceObj_;
      },
      code: function(X) {
        var obj = this.referenceObj_;
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
      },
      tableWidth: 100
    }
  ]
});
