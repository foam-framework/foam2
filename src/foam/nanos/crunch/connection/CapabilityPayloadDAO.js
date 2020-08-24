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
    'java.util.List',
    'java.util.Map',
    'java.util.HashMap'
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
        if ( id instanceof CapabilityPayload ) return null;

        DAO localCapabilityDAO = (DAO) x.get("localCapabilityDAO");

        String idToString = (String) id;
        
        if ( localCapabilityDAO.find(idToString) == null ){
          // throw new RuntimeException("Requested Capability id cannot be found");
          return null;
        }

        CrunchService crunchService = (CrunchService) x.get("crunchService");

        List grantPath = crunchService.getGrantPath(x, idToString);
        Map<String,FObject> capabilityDataObjects = new HashMap<>();

        for ( Object item : grantPath ) {
          // TODO: Verify that MinMaxCapability lists can be ignored here
          if ( item instanceof Capability ) {
            Capability cap = (Capability) item;
            FObject capDataObject = null;
            if ( cap.getOf() != null ){
              try {
                capDataObject = (FObject) cap.getOf().newInstance();
              } catch (Exception e){
                throw new RuntimeException(e);
              }
            }
            capabilityDataObjects.put(cap.getName(), capDataObject);
          }
        }

        CapabilityPayload capabilityPayload = new CapabilityPayload.Builder(x)
          .setCapabilityDataObjects(new HashMap<String,FObject>(capabilityDataObjects))
          .setId(idToString).build();
        
        return capabilityPayload;
      `
    },
    {
      name: 'select_',
      javaCode: `

        // grabbing actual capabilities based on the capabilities given in select
        DAO localCapabilityDAO = (DAO) x.get("localCapabilityDAO");
        List<Capability> rootCapabilities = ((ArraySink) localCapabilityDAO.select_(
          x,
          new ArraySink(),
          skip,
          limit,
          order,
          predicate
        )).getArray();

        CrunchService crunchService = (CrunchService) x.get("crunchService");

        // if separate capability ids submitted in select which aree part of different subtrees
        List<CapabilityPayload> capabilityPayloads = new ArrayList<>();
      
        // iterate through each capability from the select and calculate separate grant path
        for ( Capability rootCapability : rootCapabilities ){
          List grantPath = crunchService.getGrantPath(x, rootCapability.getId());
          Map<String,FObject> capabilityDataObjects = new HashMap<>();

          // Adding separate capabilityDataObject map
          for ( Object item : grantPath ) {
            if ( item instanceof Capability ) {
              Capability cap = (Capability) item;
              FObject capDataObject = null;
              if ( cap.getOf() != null ){
                try {
                  capDataObject = (FObject) cap.getOf().newInstance();
                } catch (Exception e){
                  throw new RuntimeException(e);
                }
              }
              capabilityDataObjects.put(cap.getName(), capDataObject);
            }
          }

          CapabilityPayload capabilityPayload = new CapabilityPayload.Builder(x)
            .setCapabilityDataObjects(new HashMap<String,FObject>(capabilityDataObjects))
            .setId(rootCapability.getId())
            .build();

          capabilityPayloads.add(capabilityPayload);
        }

        // TODO: need to convert capabilityPayloads to an ArraySink
        ArraySink capabilityPayloadsToArraySink = new ArraySink.Builder(x)
          .setArray(new ArrayList(capabilityPayloads))
          .build();
        
        return capabilityPayloadsToArraySink;
      `
    },
    {
      name: 'put_',
      javaCode: `
        CapabilityPayload receivingCapPayload = (CapabilityPayload) obj;

        CrunchService crunchService = (CrunchService) x.get("crunchService");

        List grantPath = crunchService.getGrantPath(x, receivingCapPayload.getId());

        Map<String,FObject> capabilityDataObjects = (HashMap<String,FObject>) receivingCapPayload.getCapabilityDataObjects();

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

        // Second pass: store UCJs

        for ( Object item : grantPath ){
          if ( item instanceof Capability ) {
            Capability cap = (Capability) item;

            if ( ! capabilityDataObjects.containsKey(cap.getName()) ){
              throw new RuntimeException(
                "Required capability does not exist in capabilityDataObject: " + cap.getName()
              );
            }

            FObject dataObj = capabilityDataObjects.get(cap.getName());
            String targetId = cap.getId();

            crunchService.updateJunction(x, targetId, dataObj);
          }
        }

        return obj;
      `
    }
  ],
});
