/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.lite',
  name: 'CapableDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.nanos.crunch.lite.Capable',
    'foam.nanos.crunch.lite.CapablePayload',
    'java.util.Arrays',
    'java.util.ArrayList',
    'java.util.List'
  ],


  methods: [
    {
      name: 'put_',
      javaCode: `
        // only on create
        if ( obj instanceof Capable && getDelegate().find_(x, obj) == null ) {
          Capable capableObj =  (Capable) obj;

          DAO capablePayloadDAO = capableObj.getCapablePayloadDAO(x);

          CapablePayload[] capablePayloadsArray = (CapablePayload[]) capableObj.getCapablePayloads();

          // just to ensure everything received from the client is clean
          for (int i = 0; i < capablePayloadsArray.length; i++){
            CapablePayload currentCapablePayload = capablePayloadsArray[i];
            currentCapablePayload.setStatus(foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
          }

          List<CapablePayload> capablePayloads = new ArrayList<CapablePayload>(Arrays.asList(capableObj.getCapablePayloads()));
          
          for ( CapablePayload currentPayload : capablePayloads ){
            capablePayloadDAO.put(currentPayload);
          }
        }
        return super.put_(x, obj);
      `
    }
  ],
});
