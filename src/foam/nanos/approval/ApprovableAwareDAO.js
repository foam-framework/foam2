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
    'foam.core.Detachable',
    'foam.core.FObject',
    'foam.core.MethodInfo',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.ProxySink',
    'foam.nanos.approval.Approvable',
    'foam.nanos.approval.ApprovableAware',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalRequestClassificationEnum',
    'foam.nanos.approval.ApprovalStatus',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.LifecycleAware',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserQueryService',
    'foam.nanos.logger.Logger',
    'foam.nanos.dao.Operation',
    'java.util.ArrayList',
    'java.util.Iterator',
    'java.util.List',
    'java.util.Map',
    'foam.comics.v2.userfeedback.UserFeedback',
    'foam.comics.v2.userfeedback.UserFeedbackException',
    'foam.comics.v2.userfeedback.UserFeedbackStatus'
  ],

  imports: [
    'DAO approvalRequestDAO'
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
      name: 'canMakerApproveOwnRequest',
      value: false
    },
    {
      class: 'Boolean',
      name: 'isTrackingRequestSent',
      value: true
    },
    {
      class: 'String',
      name: 'serviceName',
      javaFactory: `return foam.util.StringUtil.daoize(getOf().getObjClass().getSimpleName());`
    }
  ],

  messages: [
    { name: 'APPROVER_MSG', message: 'No Approvers exist for the model: ' },
    { name: 'APPROVER_MSG2_PART_ONE', message: 'The only approver of ' },
    { name: 'APPROVER_MSG2_PART_TWO', message: ' is the maker of this request!' },
    { name: 'SYSTEM_UPDATE_MSG', message: 'SYSTEM UPDATE - Not automatically setting LifecycleState from PENDING to ACTIVE for ' },
    { name: 'ERROR_MSG_MULTI', message: `Something went wrong. There shouldn't be multiple approvables.` },
    { name: 'ERROR_MSG2', message: 'Something went wrong. Cannot have multiple approved/rejected requests for the same request.' },
    { name: 'REQUEST_SEND_MSG', message: 'An approval request has been sent out' }
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
        getApprovalRequestDAO().inX(x).put(request);
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
        { name: 'operation', javaType: 'foam.nanos.dao.Operation' },
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
          logger.log(APPROVER_MSG + modelName);
          throw new RuntimeException(APPROVER_MSG + modelName);
        }

        if ( ! getCanMakerApproveOwnRequest() && approverIds.size() == 1 && approverIds.get(0) == user.getId() ) {
          logger.log(APPROVER_MSG2_PART_ONE + modelName + APPROVER_MSG2_PART_TWO);
          throw new RuntimeException(APPROVER_MSG2_PART_ONE + modelName + APPROVER_MSG2_PART_TWO);
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

      User user = ((Subject) x.get("subject")).getUser();
      Logger logger = (Logger) x.get("logger");

      ApprovableAware approvableAwareObj = (ApprovableAware) obj;
      LifecycleAware lifecycleObj = (LifecycleAware) obj;

      DAO approvalRequestDAO = getApprovalRequestDAO();
      DAO dao = (DAO) x.get(getDaoKey());

      FObject currentObjectInDAO = (FObject) dao.find(String.valueOf(obj.getProperty("id")));
      Predicate checkerPredicate = approvableAwareObj.getCheckerPredicate();

      if ( checkerPredicate != null && ! checkerPredicate.f(obj) ){
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
          logger.warning(SYSTEM_UPDATE_MSG + obj.getClass().getSimpleName() + ": " + primaryKey);
        }
        return super.put_(x,obj);
      }

      Operation operation = lifecycleObj.getLifecycleState() == LifecycleState.DELETED ? Operation.REMOVE :
        ( ( currentObjectInDAO == null || ((LifecycleAware) currentObjectInDAO).getLifecycleState() == LifecycleState.PENDING ) ?
            Operation.CREATE :
            Operation.UPDATE
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

      DAO filteredApprovalRequestDAO;
      String hashedId = ""; // not needed for remove case

      if ( operation == Operation.REMOVE ){
        filteredApprovalRequestDAO = (DAO) approvalRequestDAO
          .where(
            foam.mlang.MLang.AND(
              foam.mlang.MLang.EQ(ApprovalRequest.SERVER_DAO_KEY, getDaoKey()),
              foam.mlang.MLang.EQ(ApprovalRequest.OBJ_ID, String.valueOf(obj.getProperty("id"))),
              foam.mlang.MLang.EQ(ApprovalRequest.CREATED_BY, user.getId()),
              foam.mlang.MLang.EQ(ApprovalRequest.OPERATION, operation),
              foam.mlang.MLang.EQ(ApprovalRequest.IS_FULFILLED, false)
            )
          );
      } else {
        String approvableHashKey = ApprovableAware.getApprovableHashKey(x, obj, operation);

        hashedId = new StringBuilder("d")
          .append(getDaoKey())
          .append(":o")
          .append(String.valueOf(obj.getProperty("id")))
          .append(":h")
          .append(String.valueOf(approvableHashKey))
          .toString();

        DAO approvableDAO = (DAO) x.get("approvableDAO");

        List approvablesPending = ((ArraySink) approvableDAO
          .where(foam.mlang.MLang.AND(
            foam.mlang.MLang.EQ(Approvable.LOOKUP_ID, hashedId),
            foam.mlang.MLang.EQ(Approvable.STATUS, ApprovalStatus.REQUESTED)
          )).inX(getX()).select(new ArraySink())).getArray();

        // basically if no approvable is found will be default
        String approvalObjId = "N/A";

        if ( approvablesPending.size() == 1 ) {
          Approvable approvable = (Approvable) approvablesPending.get(0);
          approvalObjId = approvable.getId();
        }

        if ( approvablesPending.size() > 1 ){
          throw new RuntimeException(ERROR_MSG_MULTI);
        }

        filteredApprovalRequestDAO = (DAO) approvalRequestDAO
          .where(
            foam.mlang.MLang.AND(
              foam.mlang.MLang.EQ(ApprovalRequest.DAO_KEY, "approvableDAO"),
              foam.mlang.MLang.EQ(ApprovalRequest.OBJ_ID, approvalObjId),
              foam.mlang.MLang.EQ(ApprovalRequest.CREATED_BY, user.getId()),
              foam.mlang.MLang.EQ(ApprovalRequest.OPERATION, operation),
              foam.mlang.MLang.EQ(ApprovalRequest.IS_FULFILLED, false)
            )
          );
      }

      List pendingRequests = ((ArraySink) ((ProxySink) filteredApprovalRequestDAO
        .where(foam.mlang.MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED))
        .inX(getX())
        .select(proxy))
        .getDelegate())
        .getArray();

      // if the new list of approvers include users who are not in the original list of approvers, we want to send them the ar
      // we dont need the proxysink for this operation sink if this is non-empty, we do not need to know if there's any
      // new approvers to whom an approvalrequest for this operation should be sent.
      List fulfilledRequests = ((ArraySink) filteredApprovalRequestDAO
        .where(foam.mlang.MLang.OR(
          foam.mlang.MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.APPROVED),
          foam.mlang.MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.REJECTED),
          foam.mlang.MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.CANCELLED)
        )).inX(getX()).select(new ArraySink())).getArray();

      if ( pendingRequests.size() > 0 && fulfilledRequests.size() == 0 && approverIds.size() == 0 )
        throw new RuntimeException("There is an outstanding approval for this request.");

      if ( fulfilledRequests.size() == 1 ) {
        ApprovalRequest fulfilledRequest = (ApprovalRequest) fulfilledRequests.get(0);
        fulfilledRequest.setIsFulfilled(true);

        User lastModifiedBy = (User) ((DAO) x.get("bareUserDAO")).find(fulfilledRequest.getLastModifiedBy());
        if ( lastModifiedBy == null ) lastModifiedBy = new User.Builder(x).setId(fulfilledRequest.getLastModifiedBy()).build();
        Subject subject = new Subject.Builder(x).setUser(lastModifiedBy).build();
        X approvalX = getX().put("subject", subject);

        approvalRequestDAO.inX(approvalX).put(fulfilledRequest);

        if ( fulfilledRequest.getStatus() == ApprovalStatus.APPROVED ) {

          if ( operation == Operation.CREATE ){
            lifecycleObj.setLifecycleState(LifecycleState.ACTIVE);
          }
          return super.put_(x,obj);
        }

        return null;  // as request has been REJECTED or CANCELLED
      }

      if ( fulfilledRequests.size() > 1 ) {
        logger.error(ERROR_MSG2);
        throw new RuntimeException(ERROR_MSG2);
      }

      ApprovalRequest approvalRequest;

      // remove doesn't need an approvable to be generated since we already have the object
      if ( operation == Operation.REMOVE ){
        approvalRequest = new ApprovalRequest.Builder(x)
          .setDaoKey(getServiceName())
          .setServerDaoKey(getDaoKey())
          .setObjId(String.valueOf(obj.getProperty("id")))
          .setClassificationEnum(ApprovalRequestClassificationEnum.APPROVABLE_REQUEST)
          .setDescription(getOf().getObjClass().getSimpleName())
          .setOperation(operation)
          .setCreatedBy(user.getId())
          .setStatus(ApprovalStatus.REQUESTED).build();
      } else {
        DAO approvableDAO = (DAO) x.get("approvableDAO");

        Iterator allProperties = obj.getClassInfo().getAxiomsByClass(PropertyInfo.class).iterator();

        // then handle the diff here and attach it into the approval request
        FObject objectToDiffAgainst = currentObjectInDAO;

        // diffing against an empty object gives us the properties in map form for create
        if ( operation == Operation.CREATE ){
          try {
            objectToDiffAgainst = (FObject) obj.getClassInfo().newInstance();
          } catch (Exception e){
            throw new RuntimeException(e);
          }
        }

        Map propertiesToApprove = objectToDiffAgainst.diff(obj);

        // No change, just returns obj
        if ( propertiesToApprove.isEmpty() ) {
          return obj;
        }

        Approvable approvable = (Approvable) approvableDAO.put_(x, new Approvable.Builder(x)
          .setLookupId(hashedId)
          .setDaoKey(getServiceName())
          .setServerDaoKey(getDaoKey())
          .setStatus(ApprovalStatus.REQUESTED)
          .setObjId(String.valueOf(obj.getProperty("id")))
          .setOperation(operation)
          .setOf(obj.getClassInfo())
          .setPropertiesToUpdate(propertiesToApprove).build());

        approvalRequest = new ApprovalRequest.Builder(x)
          .setDaoKey("approvableDAO")
          .setObjId(approvable.getId())
          .setClassificationEnum(ApprovalRequestClassificationEnum.APPROVABLE_REQUEST)
          .setDescription(getOf().getObjClass().getSimpleName())
          .setOperation(operation)
          .setCreatedBy(user.getId())
          .setStatus(ApprovalStatus.REQUESTED).build();
      }

      fullSend(x, approvalRequest, obj, approverIds);

      // TODO: the following is a temporary fix will need to create an actual exception and pass feedback as a property
      // throw new RuntimeException(REQUEST_SEND_MSG); // we aren't updating to deleted
      throw new UserFeedbackException.Builder(x)
        .setUserFeedback(new UserFeedback.Builder(x)
          .setStatus(UserFeedbackStatus.SUCCESS)
          .setMessage(REQUEST_SEND_MSG)
          .build()
        ).build();
      `
    }
  ]
});
