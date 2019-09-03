/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'ORBitalDAO',
  documentation : 'DAO class used to delegate a method execution request to the specified object (specified by an ORBRequest object).',
  extends: 'foam.dao.ProxyDAO',
  flags: ['java'],

  javaImports: [
    'foam.core.FObject',
    'foam.core.ClassInfo',
    'foam.core.MethodInfo',
    'foam.core.X',
    'foam.nanos.logger.Logger'
  ],

  properties: [

  ],

  methods: [
    {
      name: 'cmd_',
      type: 'Object',

      args: [
        { name: 'x' , type: 'foam.core.X'}, { name: 'obj' , type: 'Object' }
      ],

      javaCode: `
        ORBRequest request = null;
            try {
              request = (ORBRequest) obj;
            } catch (Exception e) {
              Logger logger = (Logger) x.get("logger");
              logger.error(e);
            }

            String receiverID = request.getReceiverObjectID();

            // Get the receiving object
            Object robj = request.getReceiverObject();
            FObject receiverFObj = ( robj != null && robj instanceof FObject )? (FObject) robj : null;
            receiverFObj =  ( receiverFObj == null && receiverID != null )? (FObject) x.get(receiverID) : null;

            if ( receiverFObj != null ) {
              ClassInfo classInfo = receiverFObj.getClassInfo();
              MethodInfo methodInfo = (MethodInfo) classInfo.getAxiomByName(request.getMethodName());
              return methodInfo.call(x, receiverFObj, request.getArgs());
            } else {
              return null;
            }
      `
    }
  ]

});
