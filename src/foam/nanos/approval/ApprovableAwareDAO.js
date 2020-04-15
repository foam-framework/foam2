/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'ApprovableAwareDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.comics.v2.userfeedback.UserFeedback',
    'foam.comics.v2.userfeedback.UserFeedbackAware',
    'foam.comics.v2.userfeedback.UserFeedbackException',
    'foam.comics.v2.userfeedback.UserFeedbackStatus',
    'foam.core.Detachable',
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.ProxySink',
    'foam.lib.PropertyPredicate',
    'foam.mlang.MLang',
    'foam.mlang.MLang.*',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.approval.Approvable',
    'foam.nanos.approval.ApprovableAware',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.auth.LifecycleAware',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserQueryService',
    'foam.nanos.logger.Logger',
    'foam.nanos.ruler.Operations',
    'foam.util.SafetyUtil',
    'java.util.ArrayList',
    'java.util.Iterator',
    'java.util.List',
    'java.util.Map',
    'java.util.Set'
  ],

  properties: [
    {
      class: 'String',
      name: 'daoKey'
    },
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'Boolean',
      name: 'isEnabled',
      value: true
    },
    {
      class: 'Boolean',
      name: 'canMakerApproveOwnRequest',
      value: false
    },
    {
      class: 'Boolean',
      name: 'isTrackingRequestSent',
      value: true
    }
  ],

  methods: [
    {
      name: 'sendSingleRequest',
      documentation: `
        A helper method which sets the approver id of an approval request you want sent to
        one to many approvers and submits it to the approvalRequestDAO
      `,
      type: 'void',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'req', type: 'ApprovalRequest' },
        { name: 'userId', type: 'long' }
      ],
      javaCode: `
        ApprovalRequest request = (ApprovalRequest) req.fclone();
        request.clearId();
        request.setApprover(userId);
        ((DAO) x.get("approvalRequestDAO")).put_(x, request);
      `
    },
    {
      name: 'fullSend',
      documentation: `
        A method which can be overidden to define how to send an approval request to
        multiple approvers and how those approvers are collected in the first place
      `,
      type: 'void',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'request', type: 'ApprovalRequest' },
        { name: 'obj', type: 'FObject' },
        { name: 'approverIds', type: 'List', javaType: 'List<Long>' }
      ],
      javaCode:`
      Logger logger = (Logger) x.get("logger");

      if ( getIsTrackingRequestSent() ) {
        ApprovalRequest trackingRequest = (ApprovalRequest) request.fclone();
        trackingRequest.setIsTrackingRequest(true);

        sendSingleRequest(x, trackingRequest, trackingRequest.getCreatedBy());

        approverIds.remove(trackingRequest.getCreatedBy());
      }

      for ( int i = 0; i < approverIds.size(); i++ ) {
        sendSingleRequest(x, request, approverIds.get(i));
      }
      `
    },
    {
      name: 'findApprovers',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'obj', type: 'FObject' },
        { name: 'operation', javaType: 'foam.nanos.ruler.Operations' },
        { name: 'user', javaType: 'foam.nanos.auth.User' }
      ],
      javaType: 'List<Long>',
      javaCode: ` 
        Logger logger = (Logger) x.get("logger");
        DAO requestingDAO = (DAO) x.get(getDaoKey());

        String modelName = requestingDAO.getOf().getObjClass().getSimpleName();
        UserQueryService userQueryService = (UserQueryService) x.get("userQueryService");
        List<Long> approverIds = userQueryService.getAllApprovers(x, modelName);
          
        if ( approverIds == null || approverIds.size() <= 0 ) {
          logger.log("No Approvers exist for the model: " + modelName);
          throw new RuntimeException("No Approvers exist for the model: " + modelName);
        }

        if ( ! getCanMakerApproveOwnRequest() && approverIds.size() == 1 && approverIds.get(0) == user.getId() ) {
          logger.log("The only approver of " + modelName + " is the maker of this request!");
          throw new RuntimeException("The only approver of " + modelName + " is the maker of this request!");
        }

        return approverIds;
      `
    },
    {
      name: 'put_',
      javaCode: `
      if ( ! ( obj instanceof LifecycleAware ) )
      {
        return super.put_(x, obj);
      }

      User user = (User) x.get("user");
      Logger logger = (Logger) x.get("logger");

      LifecycleAware lifecycleObj = (LifecycleAware) obj;

      DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
      DAO dao = (DAO) x.get(getDaoKey());

      ApprovableAware approvableAwareObj = (ApprovableAware) obj;
      FObject currentObjectInDAO = (FObject) dao.find(approvableAwareObj.getApprovableKey());
      
      if ( ! getIsEnabled() ){
        if ( lifecycleObj.getLifecycleState() == LifecycleState.PENDING && currentObjectInDAO == null ){
          lifecycleObj.setLifecycleState(LifecycleState.ACTIVE);
        }
        return super.put_(x,obj);
      }

      // system and admins override the approval process
      if ( user != null && ( user.getId() == User.SYSTEM_USER_ID || user.getGroup().equals("admin") || user.getGroup().equals("system") ) ) {
        if ( currentObjectInDAO == null && lifecycleObj.getLifecycleState() == LifecycleState.PENDING && user.getId() != User.SYSTEM_USER_ID ){
          lifecycleObj.setLifecycleState(LifecycleState.ACTIVE);
        } 
        else if ( lifecycleObj.getLifecycleState() == LifecycleState.PENDING && user.getId() == User.SYSTEM_USER_ID ) {
          // Adding log message in case this change breaks something unexpected
          Object primaryKey = obj instanceof foam.core.Identifiable ? ((foam.core.Identifiable)obj).getPrimaryKey() : null;
          logger.warning("SYSTEM UPDATE - Not automatically setting LifecycleState from PENDING to ACTIVE for " + obj.getClass().getSimpleName() + ": " + primaryKey);
        }
        return super.put_(x,obj);
      }
      
      Operations operation = lifecycleObj.getLifecycleState() == LifecycleState.DELETED ? Operations.REMOVE : 
        ( ( currentObjectInDAO == null || ((LifecycleAware) currentObjectInDAO).getLifecycleState() == LifecycleState.PENDING ) ? 
            Operations.CREATE :
            Operations.UPDATE
        );

      List<Long> approverIds = findApprovers(x, (FObject) obj, operation, user);

      // a proxysink which removes the users who have already been sent approvalrequests from the list of approverIds
      ProxySink proxy = new ProxySink(x, new ArraySink()) {
        @Override
        public void put(Object o, Detachable sub) {
          Long approver = ((ApprovalRequest) o).getApprover();
          approverIds.remove(approver);
          getDelegate().put(o, sub);  
        }
      };

      if ( operation == Operations.REMOVE ) {
        approvableAwareObj = (ApprovableAware) currentObjectInDAO;

        DAO filteredApprovalRequestDAO = (DAO) approvalRequestDAO
          .where(
            foam.mlang.MLang.AND(
              foam.mlang.MLang.EQ(ApprovalRequest.DAO_KEY, getDaoKey()),
              foam.mlang.MLang.EQ(ApprovalRequest.OBJ_ID, approvableAwareObj.getApprovableKey()),
              foam.mlang.MLang.EQ(ApprovalRequest.CREATED_BY, user.getId()),
              foam.mlang.MLang.EQ(ApprovalRequest.OPERATION, Operations.REMOVE),
              foam.mlang.MLang.EQ(ApprovalRequest.IS_FULFILLED, false)
            )
          );

        List pendingRequests = ((ArraySink) ((ProxySink) filteredApprovalRequestDAO
        .where(foam.mlang.MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED))
        .select(proxy))
        .getDelegate())
        .getArray();

        // if the new list of approvers include users who are not in the original list of approvers, we want to send them the ar 
        // we dont need the proxysink for this operation sink if this is non-empty, we do not need to know if there's any 
        // new approvers to whom an approvalrequest for this operation should be sent.
        List approvedObjRemoveRequests = ((ArraySink) filteredApprovalRequestDAO
          .where(foam.mlang.MLang.OR(
            foam.mlang.MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.APPROVED),
            foam.mlang.MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.REJECTED)
          )).select(new ArraySink())).getArray();

        if ( pendingRequests.size() > 0 && approvedObjRemoveRequests.size() == 0 && approverIds.size() == 0 ) 
          throw new RuntimeException("There already exists approval requests for this operation");

        if ( approvedObjRemoveRequests.size() == 1 ) {
          ApprovalRequest fulfilledRequest = (ApprovalRequest) approvedObjRemoveRequests.get(0);
          fulfilledRequest.setIsFulfilled(true);

          X approvalX = getX().put("user", new User.Builder(x).setId(fulfilledRequest.getLastModifiedBy()).build());
          approvalRequestDAO.put_(approvalX, fulfilledRequest);

          if ( fulfilledRequest.getStatus() == ApprovalStatus.APPROVED ) {
            return super.put_(x,obj);
          } 

          return null;  // as request has been REJECTED
        } 

        if ( approvedObjRemoveRequests.size() > 1 ) {
          logger.error("Something went wrong cannot have multiple approved/rejected requests for the same request!");
          throw new RuntimeException("Something went wrong cannot have multiple approved/rejected requests for the same request!");
        } 

        ApprovalRequest approvalRequest = new ApprovalRequest.Builder(x)
          .setDaoKey(getDaoKey())
          .setObjId(approvableAwareObj.getApprovableKey())
          .setClassification(getOf().getObjClass().getSimpleName())
          .setOperation(Operations.REMOVE)
          .setCreatedBy(user.getId())
          .setStatus(ApprovalStatus.REQUESTED).build();

        fullSend(x, approvalRequest, obj, approverIds);

        // TODO: the following is a temporary fix will need to create an actual exception and pass feedback as a property
        throw new RuntimeException("An approval request has been sent out."); // we aren't updating to deleted
      }

      if ( operation == Operations.CREATE ) {
        if ( lifecycleObj.getLifecycleState() == LifecycleState.ACTIVE ) { 
          return super.put_(x,obj);
        } else if ( lifecycleObj.getLifecycleState() == LifecycleState.PENDING ) {

          DAO filteredApprovalRequestDAO = (DAO) approvalRequestDAO
            .where(
              foam.mlang.MLang.AND(
                foam.mlang.MLang.EQ(ApprovalRequest.DAO_KEY, getDaoKey()),
                foam.mlang.MLang.EQ(ApprovalRequest.APPROVABLE_CREATE_KEY, ApprovableAware.getApprovableCreateKey(x, obj)),
                foam.mlang.MLang.EQ(ApprovalRequest.CREATED_BY, user.getId()),
                foam.mlang.MLang.EQ(ApprovalRequest.OPERATION, Operations.CREATE),
                foam.mlang.MLang.EQ(ApprovalRequest.IS_FULFILLED, false)
              )
            );

          List pendingRequests = ((ArraySink) ((ProxySink) filteredApprovalRequestDAO
            .where(foam.mlang.MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED))
            .select(proxy))
            .getDelegate())
            .getArray();

          // if the new list of approvers include users who are not in the original list of approvers, we want to send them the ar 
          // we dont need the proxysink for this operation sink if this is non-empty, we do not need to know if there's any 
          // new approvers to whom an approvalrequest for this operation should be sent.
          List approvedObjCreateRequests = ((ArraySink) filteredApprovalRequestDAO
            .where(foam.mlang.MLang.OR(
              foam.mlang.MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.APPROVED),
              foam.mlang.MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.REJECTED)
            )).select(new ArraySink())).getArray();

          if ( pendingRequests.size() > 0 && approvedObjCreateRequests.size() == 0 ) 
            throw new RuntimeException("There already exists approval requests for this operation");

          if ( approvedObjCreateRequests.size() == 1 ) {
            ApprovalRequest fulfilledRequest = (ApprovalRequest) approvedObjCreateRequests.get(0);
            fulfilledRequest.setIsFulfilled(true);

            X approvalX = getX().put("user", new User.Builder(x).setId(fulfilledRequest.getLastModifiedBy()).build());
            approvalRequestDAO.put_(approvalX, fulfilledRequest);

            if ( fulfilledRequest.getStatus() == ApprovalStatus.APPROVED ) {
              lifecycleObj.setLifecycleState(LifecycleState.ACTIVE);
              return super.put_(x,obj);
            } 

            // create request has been rejected is only where we mark the object as REJECTED
            lifecycleObj.setLifecycleState(LifecycleState.REJECTED);
            return super.put_(x,obj); 
          } 
          if ( approvedObjCreateRequests.size() > 1 ) {
            logger.error("Something went wrong cannot have multiple approved/rejected requests for the same request!");
            throw new RuntimeException("Something went wrong cannot have multiple approved/rejected requests for the same request!");
          } 

          ApprovalRequest approvalRequest = new ApprovalRequest.Builder(x)
            .setDaoKey(getDaoKey())
            .setApprovableCreateKey(ApprovableAware.getApprovableCreateKey(x, obj))
            .setObjId(approvableAwareObj.getApprovableKey())
            .setClassification(getOf().getObjClass().getSimpleName())
            .setOperation(Operations.CREATE)
            .setCreatedBy(user.getId())
            .setStatus(ApprovalStatus.REQUESTED).build();

          fullSend(x, approvalRequest, obj, approverIds);

          // we are storing the object in it's related dao with a lifecycle state of PENDING
          UserFeedbackAware feedbackAwareObj = (UserFeedbackAware) obj;

          UserFeedback newUserFeedback = new UserFeedback.Builder(x)
            .setStatus(UserFeedbackStatus.SUCCESS)
            .setMessage("An approval request has been sent out.")
            .setNext(feedbackAwareObj.getUserFeedback()).build();

          FObject clonedObj = obj.fclone();

          UserFeedbackAware feedbackAwareClonedObj = (UserFeedbackAware) clonedObj;

          feedbackAwareClonedObj.setUserFeedback(newUserFeedback);

          return super.put_(x,clonedObj);
        } else {
          logger.error("Something went wrong used an invalid lifecycle status for create!");
          throw new RuntimeException("Something went wrong used an invalid lifecycle status for create!");
        }
      } else {
        Iterator allProperties = obj.getClassInfo().getAxiomsByClass(PropertyInfo.class).iterator();

        List<String> storageTransientPropertyNames = new ArrayList<>();

        while ( allProperties.hasNext() ){
          PropertyInfo prop = (PropertyInfo) allProperties.next();

          if ( prop.getStorageTransient() ){
            storageTransientPropertyNames.add(prop.getName());
          }
        }

        // then handle the diff here and attach it into the approval request
        Map updatedProperties = currentObjectInDAO.diff(obj);

        for ( int i = 0; i < storageTransientPropertyNames.size(); i++ ){
          updatedProperties.remove(storageTransientPropertyNames.get(i));
        }

        // No change, just returns obj
        if ( updatedProperties.isEmpty() ) {
          return obj;
        }

        // change last modified by to be the user
        updatedProperties.put("lastModifiedBy", user.getId());

        // remove lastmodified prop to exclude it from hash
        Object lastModified = updatedProperties.remove("lastModified");

        DAO approvableDAO = (DAO) x.get("approvableDAO");

        String daoKey = "d" + getDaoKey();
        String objId = ":o" + approvableAwareObj.getApprovableKey();
        String hashedMap = ":m" + String.valueOf(updatedProperties.hashCode());
  
        String hashedId = daoKey + objId + hashedMap;

        // put back lastmodified prop after hashing 
        updatedProperties.put("lastModified", lastModified);

        DAO filteredApprovalRequestDAO = (DAO) approvalRequestDAO
          .where(
            foam.mlang.MLang.AND(
              foam.mlang.MLang.EQ(ApprovalRequest.DAO_KEY, "approvableDAO"),
              foam.mlang.MLang.EQ(ApprovalRequest.OBJ_ID, hashedId),
              foam.mlang.MLang.EQ(ApprovalRequest.CREATED_BY, user.getId()),
              foam.mlang.MLang.EQ(ApprovalRequest.OPERATION, Operations.UPDATE),
              foam.mlang.MLang.EQ(ApprovalRequest.IS_FULFILLED, false)
            )
          );

        List pendingRequests = ((ArraySink) ((ProxySink) filteredApprovalRequestDAO
          .where(foam.mlang.MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED))
          .select(proxy))
          .getDelegate())
          .getArray();

        // if the new list of approvers include users who are not in the original list of approvers, we want to send them the ar 
        // we dont need the proxysink for this operation sink if this is non-empty, we do not need to know if there's any 
        // new approvers to whom an approvalrequest for this operation should be sent.
        List approvedObjUpdateRequests = ((ArraySink) filteredApprovalRequestDAO
          .where(foam.mlang.MLang.OR(
            foam.mlang.MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.APPROVED),
            foam.mlang.MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.REJECTED)
          )).select(new ArraySink())).getArray();

        if ( pendingRequests.size() > 0 && approvedObjUpdateRequests.size() == 0 ) 
          throw new RuntimeException("There already exists approval requests for this operation");

        if ( approvedObjUpdateRequests.size() == 1 ) {
          ApprovalRequest fulfilledRequest = (ApprovalRequest) approvedObjUpdateRequests.get(0);
          fulfilledRequest.setIsFulfilled(true);

          X approvalX = getX().put("user", new User.Builder(x).setId(fulfilledRequest.getLastModifiedBy()).build());
          approvalRequestDAO.put_(approvalX, fulfilledRequest);

          if ( fulfilledRequest.getStatus() == ApprovalStatus.APPROVED ) {
            return super.put_(x,obj);
          }

          return null; // as request has been REJECTED
        }

        if ( approvedObjUpdateRequests.size() > 1 ) {
          logger.error("Something went wrong cannot have multiple approved/rejected requests for the same request!");
          throw new RuntimeException("Something went wrong cannot have multiple approved/rejected requests for the same request!");
        }

        updatedProperties.put("lastModified", lastModified);

        Approvable approvable = (Approvable) approvableDAO.put_(x, new Approvable.Builder(x)
          .setId(hashedId)
          .setDaoKey(getDaoKey())
          .setStatus(ApprovalStatus.REQUESTED)
          .setObjId(approvableAwareObj.getApprovableKey())
          .setPropertiesToUpdate(updatedProperties).build());

        ApprovalRequest approvalRequest = new ApprovalRequest.Builder(x)
          .setDaoKey("approvableDAO")
          .setObjId(approvable.getId())
          .setClassification(getOf().getObjClass().getSimpleName())
          .setOperation(Operations.UPDATE)
          .setCreatedBy(user.getId())
          .setStatus(ApprovalStatus.REQUESTED).build();

        fullSend(x, approvalRequest, obj, approverIds);

        UserFeedbackAware feedbackAwareObj = (UserFeedbackAware) obj;

        UserFeedback newUserFeedback = new UserFeedback.Builder(x)
          .setStatus(UserFeedbackStatus.SUCCESS)
          .setMessage("An approval request has been sent out.")
          .setNext(feedbackAwareObj.getUserFeedback()).build();

        FObject clonedCurrentObj = currentObjectInDAO.fclone();

        UserFeedbackAware feedbackAwareCurrentObj = (UserFeedbackAware) clonedCurrentObj;

        feedbackAwareCurrentObj.setUserFeedback(newUserFeedback);

        return clonedCurrentObj; // we aren't updating the object just yet so return the old one
      }
      `
    }
  ]
});
