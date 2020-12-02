/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'PopulateApprovalRequestsDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'DAO decorator that populates approval requests to object on DAO.find.',

  imports: [
    'DAO approvalRequestDAO'
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'String',
      name: 'daoKey',
      documentation: 'DAO key for looking up the associated approval requests'
    },
    {
      class: 'String',
      name: 'propName',
      value: 'approvalRequests',
      documentation: 'Name of property on the object to be populated with approval requests'
    }
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        var result = (FObject) getDelegate().find_(x, id);
        if ( result != null ) {
          List<ApprovalRequest> approvalRequests = ((ArraySink)
            getApprovalRequestDAO().where(
              AND(
                EQ(ApprovalRequest.OBJ_ID, result.getProperty("id")),
                OR(
                  EQ(ApprovalRequest.DAO_KEY, getDaoKey()),
                  EQ(ApprovalRequest.SERVER_DAO_KEY, getDaoKey())
                )
              )
            ).select(new ArraySink())).getArray();

          var size = approvalRequests.size();
          if ( size > 0 ) {
            result = result.fclone();
            result.setProperty(getPropName(), approvalRequests.toArray(
              new ApprovalRequest[size]));
          }
        }

        return result;
      `
    }
  ]
});
