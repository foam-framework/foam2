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

        if ( ! ( obj instanceof ORBRequest ) ) return getDelegate().cmd_(x, obj);
        ORBRequest request = (ORBRequest) obj;

        String receiverID = request.getReceiverObjectID();

        // Get the receiving object
        FObject receiverFObj = request.getReceiverObject();

        receiverFObj =  ( receiverFObj == null && receiverID != null )? (FObject) x.get(receiverID) : receiverFObj;

        if ( receiverFObj == null ) return null;

        ClassInfo classInfo = receiverFObj.getClassInfo();
        MethodInfo methodInfo = (MethodInfo) classInfo.getAxiomByName(request.getMethodName());
        return methodInfo.call(x, receiverFObj, request.getArgs());

      `
    }
  ]

});

