/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.connection',
  name: 'CapabilityPayloadDAO',
  extends: 'foam.dao.ProxyDAO',
  flags: ['java'],

  javaImports: [
    'foam.dao.*',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.dao.ArraySink',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.order.Comparator',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.connection.CapabilityPayload',
    'java.util.ArrayList',
    'java.util.List'
  ],

  documentation: `
    CapabilityPayload details the data objects needed and grant path for a specific capability
  `,

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public CapabilityPayloadDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
          } 
        `);
      }
    }
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        if ( id instanceof CapabilityPayload ) return super.find_(x, ((CapabilityPayload) id).getId());

        DAO localCapabilityDAO = (DAO) x.get("localCapabilityDAO");

        String idToString = (String) id;

        // TODO: IN deployment we won't even be storing CapabilityPayload
        if ( localCapabilityDAO.find(idToString) != null ){
          CrunchService crunchService = (CrunchService) x.get("crunchService");

          List grantPath = crunchService.getGrantPath(x, idToString);
          List<Object> capabilityDataObjects = new ArrayList<>();
          List<String> capabilities = new ArrayList<>();
          for ( Object item : grantPath ) {
            // TODO: Verify that MinMaxCapability lists can be ignored here
            if ( item instanceof Capability ) {
              Capability cap = (Capability) item;
              if ( cap.getOf() != null ){
                FObject newOfInstance;
                try {
                  newOfInstance = (FObject) cap.getOf().newInstance();
                } catch (Exception e){
                  throw new RuntimeException(e);
                }
                capabilityDataObjects.add(newOfInstance);
              }
              capabilities.add(cap.getId());
            }
          }

          CapabilityPayload capabilityPayload = new CapabilityPayload.Builder(x)
            .setCapabilityDataObjects(capabilityDataObjects.toArray(new Object[capabilityDataObjects.size()]))
            .setCapabilities(capabilities.toArray(new String[capabilities.size()]))
            .setTargetCapabilityId(idToString).build();
          
          return capabilityPayload;
        }

        return super.find_(x, id);
      `
    },
    {
      name: 'put_',
      javaCode: `
        CapabilityPayload sentCapPayload = (CapabilityPayload) obj;

        Object[] capabilityDataObjects = sentCapPayload.getCapabilityDataObjects();
        String[] capabilities = sentCapPayload.getCapabilities();

        // TODO: Don't think this block is needed anymore
        // // First pass: validate types provided
        // int index = 0;
        // for ( Object data : capabilityDataObjects ) {
        //   // Skip capability where 'of' property is empty
        //   while ( index < capabilityDataObjects.length && capabilityDataObjects[index] != null ) {
        //     index++;
        //   }

        //   if ( index >= capabilityDataObjects.length ) {
        //     throw new RuntimeException("Unexpected data provided: " + data);
        //   }

        //   FObject dataObj = (FObject) data;
        //   ClassInfo clsInfo = dataObj.getClassInfo();
        //   if ( !SafetyUtil.equals(clsInfo.getId(), capabilityDataObjects[index]) ) {
        //     throw new RuntimeException(String.format(
        //       "Recieved incorrect type at index %d: "
        //       + "found '%s', but expected '%s'.", 
        //       index, clsInfo.getId(), capabilityDataObjects[index]
        //     ));
        //   }

        //   // increment the index
        //   index++;
        // }

        CrunchService crunchService = (CrunchService) x.get("crunchService");

        // Second pass: store UCJs
        int capabilitiesIndex = 0;
        for ( int i = 0 ; i < capabilities.length ; i++ ) {
          FObject dataObj = null;
          if ( capabilitiesIndex < capabilityDataObjects.length && capabilityDataObjects[i] != null ) {
            dataObj = (FObject) capabilityDataObjects[capabilitiesIndex++];
          }
          String targetId = capabilities[i];
          crunchService.updateJunction(x, targetId, dataObj);
        }

        // TODO: Saving just for testing
        return getDelegate().put_(x, obj);
      `
    }
  ],
});
