/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'ApprovalDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.mlang.sink.Sum',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.ruler.Operations',
    'foam.util.SafetyUtil',

    'static foam.mlang.MLang.*'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(
          `
            public ApprovalDAO(X x, DAO delegate) {
              setX(x);
              setDelegate(delegate);
            }
          `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        DAO requestDAO = ((DAO)x.get("approvalRequestDAO"));
        ApprovalRequest old = (ApprovalRequest) requestDAO.find(obj);
        ApprovalRequest request = (ApprovalRequest) getDelegate().put(obj);
    
        if ( old != null && old.getStatus() != request.getStatus()
          || old == null && request.getStatus() != ApprovalStatus.REQUESTED
        ) {
          DAO requests = ApprovalRequestUtil.getAllRequests(x, request.getObjId(), request.getClassification());
          // if not a cancellation request and points are sufficient to consider object approved
          if (
            request.getStatus() == ApprovalStatus.CANCELLED ||
            getCurrentPoints(requests) >= request.getRequiredPoints() ||
            getCurrentRejectedPoints(requests) >= request.getRequiredRejectedPoints()
          ) {
    
            //removes all the requests that were not approved to clean up approvalRequestDAO
            removeUnusedRequests(requests);
            if (
              request.getStatus() == ApprovalStatus.APPROVED ||
              (
                request.getStatus() == ApprovalStatus.REJECTED && ((ApprovalRequest) request).getOperation() == Operations.CREATE
              )
            ){
              //puts object to its original dao
              try {
                rePutObject(x, request);
              } catch ( Exception e ) {
                request.setStatus(ApprovalStatus.REQUESTED);
                getDelegate().put(request);
                throw new RuntimeException(e);
              }
            } else {
              // since no more needs to be done with the request from this point onwards
              request.setIsFulfilled(true);
              getDelegate().put(request);
            }
          }
        }
        return request;
      `
    },
    {
      name: 'rePutObject',
      visibility: 'protected',
      type: 'Void',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'ApprovalRequest', name: 'request' }
      ],
      javaCode: `
        String daoKey = request.getServerDaoKey() != null && ! SafetyUtil.isEmpty(request.getServerDaoKey()) ? request.getServerDaoKey() : request.getDaoKey();
        DAO dao = (DAO) x.get(daoKey);
        FObject found = dao.inX(x).find(request.getObjId()).fclone();

        DAO userDAO = (DAO) x.get("localUserDAO");
        User initiatingUser = (User) userDAO.find(((ApprovalRequest) request).getCreatedBy());
        Subject subject = new Subject.Builder(x).setUser(initiatingUser).build();
        X initiatingUserX = x.put("subject", subject);

        if ( ((ApprovalRequest) request).getOperation() == Operations.REMOVE ) {
          dao.inX(initiatingUserX).remove(found);
        } else {
          dao.inX(initiatingUserX).put(found);
        }
      `
    },
    {
      name: 'removeUnusedRequests',
      visibility: 'protected',
      type: 'Void',
      args: [
        { type: 'DAO', name: 'dao' }
      ],
      javaCode: `
        dao.where(EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED)).removeAll();
      `
    },
    {
      name: 'getCurrentPoints',
      visibility: 'protected',
      type: 'Long',
      args: [
        {
          type: 'DAO', name: 'dao' }
      ],
      javaCode: `
        return ((Double)
          ((Sum) dao
            .where(EQ(ApprovalRequest.STATUS, ApprovalStatus.APPROVED))
            .select(SUM(ApprovalRequest.POINTS))
          ).getValue()
        ).longValue();
      `
    },
    {
      name: 'getCurrentRejectedPoints',
      visibility: 'protected',
      type: 'Long',
      args: [
        { type: 'DAO', name: 'dao' }
      ],
      javaCode: `
        return ((Double)
          ((Sum) dao
            .where(EQ(ApprovalRequest.STATUS, ApprovalStatus.REJECTED))
            .select(SUM(ApprovalRequest.POINTS))
          ).getValue()
        ).longValue();
      `
    }
  ]
});
