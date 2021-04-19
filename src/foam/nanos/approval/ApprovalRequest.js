/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'ApprovalRequest',
  plural: 'ApprovalRequests',
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
    'foam.nanos.dao.Operation',
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
    'foam.u2.dialog.Popup',
    'foam.log.LogLevel',
    'foam.nanos.approval.ApprovalStatus'
  ],

  imports: [
    'DAO approvalRequestDAO',
    'ctrl',
    'currentMenu',
    'notify',
    'stack',
    'summaryView?',
    'objectSummaryView?'
  ],

  tableColumns: [
    'id',
    'description',
    'classification',
    'objId',
    'approver.legalName',
    'status',
    'memo'
  ],

  sections: [
    {
      name: 'approvalRequestInformation',
      order: 10
    },
    {
      name: 'systemInformation',
      order: 30,
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

  messages: [
    { name: 'BACK_LABEL', message: 'Back' }
  ],

  properties: [
    {
      // TODO: True fix will be with ReferenceView
      class: 'String',
      name: 'referenceSummary',
      section: 'approvalRequestInformation',
      order: 21,
      gridColumns: 6,
      transient: true,
      tableWidth: 200,
      visibility: 'RO',
      tableCellFormatter: function(_,obj) {
        let self = this;
        try {
          this.__subSubContext__[obj.daoKey].find(obj.objId).then(requestObj => {
            let referenceSummaryString = `ID:${obj.objId}`;

            if ( requestObj ){
              Promise.resolve(requestObj.toSummary()).then(function(requestObjSummary) {
                if ( requestObjSummary ){
                  referenceSummaryString = requestObjSummary;
                }

                self.add(referenceSummaryString);
              })
            }
          });
        } catch (x) {}
      },
      view: function(_, X) {
        let slot = foam.core.SimpleSlot.create();
        let data = X.data;


        X[data.daoKey] && X[data.daoKey].find(data.objId).then(requestObj => {
          let referenceSummaryString = `ID:${data.objId}`;

          if ( requestObj ){
            Promise.resolve(requestObj.toSummary()).then(function(requestObjSummary) {
              if ( requestObjSummary ){
                referenceSummaryString = requestObjSummary;
              }

              slot.set(referenceSummaryString);
            })
          }
        });

        return {
          class: 'foam.u2.view.ValueView',
          data$: slot
        };
      },
    },
    {
      class: 'Long',
      name: 'id',
      section: 'approvalRequestInformation',
      order: 10,
      gridColumns: 6,
      visibility: 'RO',
      documentation: 'Approval request primary key.'
    },
    {
      class: 'Object',
      javaType: 'Object',
      name: 'objId',
      includeInDigest: true,
      section: 'approvalRequestInformation',
      order: 20,
      gridColumns: 6,
      documentation: 'id of the object that needs approval.',
      tableWidth: 150
    },
    {
      class: 'Enum',
      of: 'foam.nanos.dao.Operation',
      name: 'operation',
      label: 'Action',
      includeInDigest: false,
      section: 'approvalRequestInformation',
      order: 30,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'description',
      documentation: `Approval request description.`,
      includeInDigest: false,
      tableWidth: 200,
      section: 'approvalRequestInformation',
      order: 40,
      gridColumns: 6
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Group',
      name: 'group',
      documentation: `When set, each user in the group will receive a request for approval.
      If "approver" property is set, "group" property is ignored.`,
      includeInDigest: false,
      section: 'approvalRequestInformation',
      order: 50,
      gridColumns: 6
    },
    {
      class: 'Enum',
      of: 'foam.nanos.approval.ApprovalStatus',
      name: 'status',
      value: 'REQUESTED',
      includeInDigest: true,
      section: 'approvalRequestInformation',
      order: 60,
      gridColumns: 6,
      javaFactory: 'return foam.nanos.approval.ApprovalStatus.REQUESTED;',
      visibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'approver',
      includeInDigest: true,
      section: 'approvalRequestInformation',
      order: 70,
      gridColumns: 6,
      documentation: `The user that is requested for approval. When set, "group" property is ignored.`,
      view: function(_, X) {
        let slot = foam.core.SimpleSlot.create();
        let data = X.data;
        let approver = data.approver;

        X.userDAO.find(approver).then(user => {
          if ( data.status != foam.nanos.approval.ApprovalStatus.REQUESTED ) {
            slot.set(user ? user.toSummary() : `User #${approver}`);
          } else if ( data.isTrackingRequest ) {
            slot.set(data.TRACKING);
          } else if ( user ) {
            if ( X.user.id != user.id ) {
              slot.set(user.toSummary());
            } else {
              slot.set(data.PENDING);
            }
          } else {
            slot.set(`User #${approver}`);
          }
        });

        return {
          class: 'foam.u2.view.ValueView',
          data$: slot
        };
      },
      tableCellFormatter: function(approver, data) {
        let self = this;
        try {
          this.__subSubContext__.userDAO.find(approver).then(user => {
            if ( data.status != foam.nanos.approval.ApprovalStatus.REQUESTED ) {
              self.add(user ? user.toSummary() : `User #${approver}`);
            } else if ( data.isTrackingRequest ) {
              self.add(data.TRACKING);
            } else if ( user ) {
              if ( self.__subSubContext__.user.id != user.id ) {
                self.add(user.toSummary());
              } else {
                self.add(data.PENDING);
              }
            } else {
              self.add(`User #${approver}`);
            }
          });
        } catch (x) {}
      },
      readVisibility: 'RO',
      createVisibility: 'HIDDEN',
      updateVisibility: 'HIDDEN'
    },
    {
      class: 'String',
      name: 'classification',
      label: 'Approval Type',
      section: 'approvalRequestInformation',
      order: 80,
      gridColumns: 6,
      includeInDigest: false,
      tableWidth: 450,
      documentation: `Should be unique to a certain type of requests and created within a single rule.
      For example "IdentityMind Business approval".
      When retrieving approval requests from a dao, do not use daoKey, use classification instead:
      mlang.AND(
        EQ(ApprovalRequest.OBJ_ID, objectId),
        EQ(ApprovalRequest.REQUEST_REFERENCE, "reference")
      )`
    },
    {
      class: 'DateTime',
      name: 'created',
      section: 'approvalRequestInformation',
      order: 100,
      gridColumns: 6,
      includeInDigest: true,
      visibility: function(created) {
        return created ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      includeInDigest: true,
      section: 'approvalRequestInformation',
      order: 110,
      gridColumns: 3,
      tableCellFormatter: function(value, obj, axiom) {
        this.__subSubContext__.userDAO
          .find(value)
          .then(user => this.add(user ? user.toSummary() : `ID: ${value}`));
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      includeInDigest: true,
      section: 'approvalRequestInformation',
      order: 115,
      gridColumns: 3,
      readPermissionRequired: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdFor',
      includeInDigest: true,
      section: 'approvalRequestInformation',
      order: 116,
      gridColumns: 3,
      tableCellFormatter: function(value, obj, axiom) {
        var defaultOutput = value ? `ID: ${value}`: "N/A";
        this.__subSubContext__.userDAO
          .find(value)
          .then(user => this.add(user ? user.toSummary() : defaultOutput));
      }
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      includeInDigest: true,
      section: 'approvalRequestInformation',
      order:  120,
      gridColumns: 6,
      visibility: function(lastModified) {
        return lastModified ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      includeInDigest: true,
      section: 'approvalRequestInformation',
      order: 130,
      gridColumns: 6,
      readPermissionRequired: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedByAgent',
      includeInDigest: true,
      section: 'approvalRequestInformation',
      order: 130,
      gridColumns: 6,
      readPermissionRequired: true
    },
    {
      class: 'String',
      name: 'memo',
      view: { class: 'foam.u2.tag.TextArea', rows: 3, cols: 60 },
      documentation: 'Meant to be used for explanation on why request was approved/rejected',
      includeInDigest: true,
      section: 'approvalRequestInformation',
      order: 135
    },
    {
      class: 'String',
      name: 'daoKey',
      section: 'systemInformation',
      order: 10,
      gridColumns: 6,
      documentation: `Used internally in approvalDAO to point where requested object can be found.
      Should not be used to retrieve approval requests for a given objects
      since an object can have multiple requests of different nature. When used in conjunction with serverDaoKey,
      the daoKey is mainly used for interaction on the client such as view reference and the properties to update view.`,
      includeInDigest: true,
    },
    {
      class: 'String',
      name: 'serverDaoKey',
      section: 'systemInformation',
      order: 20,
      gridColumns: 6,
      documentation: `Used internally in approvalDAO if an approval request concerns both a clientDAO and
      a server side dao. The server dao key is mainly used for backend actions that get executed on
      the object as a cause of the approval request being approved or rejected.`,
      factory: function(){
        return this.daoKey;
      },
      javaFactory: `
        return getDaoKey();
      `
    },
    {
      class: 'Boolean',
      name: 'isTrackingRequest',
      includeInDigest: true,
      section: 'systemInformation',
      order: 30,
      gridColumns: 6
    },
    {
      class: 'Boolean',
      name: 'isFulfilled',
      includeInDigest: false,
      section: 'systemInformation',
      order: 40,
      gridColumns: 6
    },
    {
      class: 'Int',
      name: 'points',
      documentation: `Specific to each ApprovalRequest object.
      Determines the weight of the approved request depending on the approver's role.
      Future: populated in approvalRequestDAO pipeline based on configurations.
      Currentely populated as 1.`,
      includeInDigest: false,
      section: 'systemInformation',
      order: 50,
      gridColumns: 6,
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
      includeInDigest: false,
      section: 'systemInformation',
      order: 60,
      gridColumns: 3,
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
      includeInDigest: false,
      section: 'systemInformation',
      order: 70,
      gridColumns: 3,
      visibility: function(requiredRejectedPoints) {
        return requiredRejectedPoints ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Object',
      name: 'refObjId',
      includeInDigest: true,
      section: 'systemInformation',
      order: 80,
      gridColumns: 6,
      readPermissionRequired: true,
      writePermissionRequired: true,
      documentation: `
        ID of obj displayed in view reference
        To be used in view reference action when the approvalrequest
        needs to specify its own reference, for example in the case of
        UserCapabilityJunctions where data is null.
      `
    },
    {
      class: 'String',
      name: 'refDaoKey',
      includeInDigest: true,
      section: 'systemInformation',
      order: 90,
      gridColumns: 6,
      readPermissionRequired: true,
      writePermissionRequired: true,
      documentation: `
        Daokey of obj displayed in view reference.
        To be used in view reference action when the approvalrequest
        needs to specify its own reference, for example in the case of
        UserCapabilityJunctions where data is null.
      `
    },
    {
      class: 'String',
      name: 'token',
      documentation: 'token in email for ‘click to approve’.',
      includeInDigest: true,
      section: 'systemInformation',
      order: 100,
      gridColumns: 6,
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      class: 'String',
      name: 'approvableHashKey',
      includeInDigest: true,
      hidden: true
    }
  ],

  messages: [
    {
      name: 'SUCCESS_APPROVED',
      message: 'You have successfully approved this request'
    },
    {
      name: 'SUCCESS_REJECTED',
      message: 'You have successfully rejected this request'
    },
    {
      name: 'SUCCESS_CANCELLED',
      message: 'You have successfully cancelled this request'
    },
    {
      name: 'PENDING',
      message: 'Pending'
    },
    {
      name: 'TRACKING',
      message: 'Tracking'
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

      if ( getOperation() != Operation.CREATE ){
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
      type: 'String',
      code: function() {
        return `(${this.classification}) ${this.operation}`;
      },
      javaCode: `
        return foam.util.SafetyUtil.isEmpty(getClassification()) ? "" : "(" + getClassification() + ")" + getOperation().toString();
      `
    }
  ],

  actions: [
    {
      name: 'approve',
      section: 'approvalRequestInformation',
      isAvailable: function(isTrackingRequest, status) {
        if ( status !== this.ApprovalStatus.REQUESTED ) return false;
        return ! isTrackingRequest;
      },
      code: function(X) {
        var approvedApprovalRequest = this.clone();
        approvedApprovalRequest.status = this.ApprovalStatus.APPROVED;

        this.approvalRequestDAO.put(approvedApprovalRequest).then(req => {
          this.approvalRequestDAO.cmd(this.AbstractDAO.RESET_CMD);
          this.finished.pub();
          this.notify(this.SUCCESS_APPROVED, '', this.LogLevel.INFO, true);
          X.stack.back();
        }, e => {
          this.throwError.pub(e);
          this.notify(e.message, '', this.LogLevel.ERROR, true);
        });
      }
    },
    {
      name: 'approveWithMemo',
      section: 'approvalRequestInformation',
      isAvailable: function(isTrackingRequest, status) {
        if ( status !== this.ApprovalStatus.REQUESTED ) return false;
        return ! isTrackingRequest;
      },
      code: function(X) {
        var objToAdd = X.objectSummaryView ?
          X.objectSummaryView : X.summaryView;
        objToAdd.add(this.Popup.create({ backgroundColor: 'transparent' }).tag({
          class: 'foam.u2.MemoModal',
          onExecute: this.approveWithMemoL.bind(this, X)
        }));
      }
    },
    {
      name: 'reject',
      section: 'approvalRequestInformation',
      isAvailable: function(isTrackingRequest, status) {
        if ( status !== this.ApprovalStatus.REQUESTED ) return false;
        return ! isTrackingRequest;
      },
      code: function(X) {
        var objToAdd = X.objectSummaryView ?
          X.objectSummaryView : X.summaryView;

        objToAdd.add(this.Popup.create({ backgroundColor: 'transparent' }).tag({
          class: 'foam.u2.MemoModal',
          onExecute: this.rejectWithMemo.bind(this, X),
          isMemoRequired: true
        }));
      }
    },
    {
      name: 'cancel',
      section: 'approvalRequestInformation',
      isAvailable: function(isTrackingRequest, status) {
        if ( status !== this.ApprovalStatus.REQUESTED ) return false;
        return isTrackingRequest;
      },
      code: function(X) {
        var cancelledApprovalRequest = this.clone();
        cancelledApprovalRequest.status = this.ApprovalStatus.CANCELLED;

        X.approvalRequestDAO.put(cancelledApprovalRequest).then(o => {
          X.approvalRequestDAO.cmd(this.AbstractDAO.RESET_CMD);
          this.finished.pub();

          X.notify(this.SUCCESS_CANCELLED, '', this.LogLevel.INFO, true);

          if ( X.currentMenu.id !== X.stack.top[2] ) {
            X.stack.back();
          }
        }, e => {
          this.throwError.pub(e);
          X.notify(e.message, '', this.LogLevel.ERROR, true);
        });
      }
    },
    {
      name: 'viewReference',
      section: 'approvalRequestInformation',
      isDefault: true,
      isAvailable: function() {
        var self = this;

        // TODO: To consider in new approval system rework: should we allow people to view reference for a deleted or rejected object
        // since it will now just be stored in the approvable dao
        // Do not show the action if the request was reject or approved and removed
        if ( self.status == foam.nanos.approval.ApprovalStatus.REJECTED ||
            ( self.status == foam.nanos.approval.ApprovalStatus.APPROVED &&
              self.operation == foam.nanos.dao.Operation.REMOVE) ) {
             return false;
        }

        if ( self.__subContext__[self.daoKey] ) {
          var property = self.__subContext__[self.daoKey].of.ID;
          var objId = property.adapt.call(property, self.objId, self.objId, property);
          return self.__subContext__[this.daoKey]
            .find(objId)
            .then(obj => !! obj)
            .catch(err => {
              console.warn(err.message || err);
              if ( self.refObjId && self.refDaoKey && self.__subContext__[self.refDaoKey] ) {
                property = self.__subContext__[self.refDaoKey].of.ID;
                objId = property.adapt.call(property, self.refObjId, self.refObjId, property);
                return self.__subContext__[self.refDaoKey]
                  .find(objId)
                  .then(obj => !! obj)
                  .catch(err => {
                    console.warn(err.message || err);
                    return false;
                  });
              } else {
                return false;
              }
            });
        }
      },
      code: function(X) {
        var self = this;

        // This should already be filtered out by the isAvailable, but adding here as duplicate protection
        if ( self.status == foam.nanos.approval.ApprovalStatus.REJECTED ||
           (self.status == foam.nanos.approval.ApprovalStatus.APPROVED && self.operation == foam.nanos.dao.Operation.REMOVE) ) {
             console.warn('Object is inaccessible')
             return;
        }

        var objId, daoKey, property;
        if ( self.refObjId && self.refDaoKey ) {
          daoKey = self.refDaoKey;
          property = X[daoKey].of.ID;
          objId = property.adapt.call(property, self.refObjId, self.refObjId, property);
        } else {
          daoKey = self.daoKey;
          property = X[daoKey].of.ID;
          objId = property.adapt.call(property, self.objId, self.objId, property);
        }

        return X[daoKey]
          .find(objId)
          .then(obj => {
            var of = obj.cls_;

            // If the dif of objects is calculated and stored in Map(obj.propertiesToUpdate),
            // this is for updating object approvals
            if ( obj.propertiesToUpdate ) {
              if ( obj.operation === foam.nanos.dao.Operation.CREATE ) {
                var temporaryNewObject = obj.of.create({}, X);

                var propsToUpdate = obj.propertiesToUpdate;

                var keyArray = Object.keys(propsToUpdate);

                for ( var i = 0; i < keyArray.length; i++ ) {
                  var propObj = temporaryNewObject.cls_.getAxiomByName(keyArray[i]);
                  if (
                    ! propObj ||
                    propObj.transient ||
                    propObj.storageTransient ||
                    propObj.networkTransient
                  ) continue;

                  temporaryNewObject[keyArray[i]] = propsToUpdate[keyArray[i]];
                }

                of = temporaryNewObject.cls_;

                X.stack.push({
                  class: 'foam.comics.v2.DAOSummaryView',
                  data: temporaryNewObject,
                  of: of,
                  config: foam.comics.v2.DAOControllerConfig.create({
                    daoKey: obj.daoKey,
                    of: of,
                    editPredicate: foam.mlang.predicate.False.create(),
                    createPredicate: foam.mlang.predicate.False.create(),
                    deletePredicate: foam.mlang.predicate.False.create()
                  }),
                  mementoHead: null,
                  backLabel: self.BACK_LABEL
                });
              } else {
                of = obj.of;

                // then here we created custom view to display these properties
                X.stack.push({
                  class: 'foam.nanos.approval.PropertiesToUpdateView',
                  propObject: obj.propertiesToUpdate,
                  objId: obj.objId,
                  daoKey: obj.daoKey,
                  of: of,
                  title: 'Updated Properties and Changes'
                });
              }
              return;
            }

            // else pass general view with modeled data for display
            // this is for create, deleting object approvals
            X.stack.push({
              class: 'foam.comics.v2.DAOSummaryView',
              data: obj,
              of: of,
              config: foam.comics.v2.DAOControllerConfig.create({
                daoKey: daoKey,
                of: of,
                editPredicate: foam.mlang.predicate.False.create(),
                createPredicate: foam.mlang.predicate.False.create(),
                deletePredicate: foam.mlang.predicate.False.create()
              }),
              mementoHead: null,
              backLabel: self.BACK_LABEL
            }, X);
          })
          .catch(err => {
            console.warn(err.message || err);
          });
      },
      tableWidth: 100
    }
  ],

  listeners: [
    {
      name: 'approveWithMemoL',
      code: function(X, memo) {
        var approvedApprovalRequest = this.clone();
        approvedApprovalRequest.status = this.ApprovalStatus.APPROVED;
        approvedApprovalRequest.memo = memo;

        this.approvalRequestDAO.put(approvedApprovalRequest).then(req => {
          this.approvalRequestDAO.cmd(this.AbstractDAO.RESET_CMD);
          this.finished.pub();
          this.notify(this.SUCCESS_APPROVED, '', this.LogLevel.INFO, true);

          X.stack.back();
        }, e => {
          this.throwError.pub(e);
          this.notify(e.message, '', this.LogLevel.ERROR, true);
        });
      }
    },
    {
      name: 'rejectWithMemo',
      code: function(X, memo) {
        var rejectedApprovalRequest = this.clone();
        rejectedApprovalRequest.status = this.ApprovalStatus.REJECTED;
        rejectedApprovalRequest.memo = memo;

        this.approvalRequestDAO.put(rejectedApprovalRequest).then(o => {
          this.approvalRequestDAO.cmd(this.AbstractDAO.RESET_CMD);
          this.finished.pub();
          this.notify(this.SUCCESS_REJECTED, '', this.LogLevel.INFO, true);

          X.stack.back();
        }, e => {
          this.throwError.pub(e);
          this.notify(e.message, '', this.LogLevel.ERROR, true);
        });
      }
    }
  ]
});
