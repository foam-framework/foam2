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
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.*',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.order.Comparator',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.connection.CapabilityPayload',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.util.SafetyUtil',
    'java.util.ArrayList',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map',
    'java.util.TreeMap',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.OR'
  ],

  documentation: `
    CapabilityPayloadDAO is not able to store anything. 
    
    For find and select, it defaults to looking up the respective
    query on the localCapabilityDAO, and instead returns CapabilityPayload objects based on those queries.

    For put, it expects a CapabilityPayload back and then updates UCJs based on fetching the grant path based on 
    the CapabilityPayload.id and then cross referencing the grant path with CapabilityPayload.capabilityDataObjects
    to fetch the filled out data.
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

          private Map<String, FObject> walkGrantPath(List grantPath, X x) {
            DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
            var capabilityDAO = (DAO) x.get("capabilityDAO");
            var userId = ((Subject)x.get("subject")).getRealUser().getId();
            var businessId = ((Subject)x.get("subject")).getUser().getId();

            // Collect all capabilities that belong to either the user or business
            var capabilityDataMap = new HashMap<String, FObject>();
            ((ArraySink) userCapabilityJunctionDAO.where(
              OR(
                EQ(UserCapabilityJunction.SOURCE_ID, userId),
                EQ(UserCapabilityJunction.SOURCE_ID, businessId)
              )
            ).select(new ArraySink())).getArray().forEach((item) -> {
              var ucj = (UserCapabilityJunction) item;
              var capability = (Capability) capabilityDAO.find(ucj.getTargetId());
              if ( capability != null )
                capabilityDataMap.put(capability.getName(), ucj.getData());
            });
      
            int index = 0;
            Map<String,FObject> capabilityDataObjects = new HashMap<>();
            
            while ( index < grantPath.size() )
            {
              Object item = grantPath.get(index++);

              if ( item instanceof Capability ) {
                Capability cap = (Capability) item;
                FObject capDataObject = null;
                if ( cap.getOf() != null ){
                  try {
                    capDataObject = capabilityDataMap.get(cap.getName());
                    if ( capDataObject == null )
                      capDataObject = (FObject) cap.getOf().newInstance();
                  } catch (Exception e){
                    throw new RuntimeException(e);
                  }
                }
                capabilityDataObjects.put(cap.getName(), capDataObject);
              }
              else if ( item instanceof List ) {
                grantPath.addAll((List) item);
              }
            }

            return capabilityDataObjects;
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
        var capabilityDataObjects = walkGrantPath(crunchService.getGrantPath(x, idToString), x);

        CapabilityPayload capabilityPayload = new CapabilityPayload.Builder(x)
          .setCapabilityDataObjects(new TreeMap<String,FObject>(capabilityDataObjects))
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
          var capabilityDataObjects = walkGrantPath(crunchService.getGrantPath(x, rootCapability.getId()), x);

          CapabilityPayload capabilityPayload = new CapabilityPayload.Builder(x)
            .setCapabilityDataObjects(new TreeMap<String,FObject>(capabilityDataObjects))
            .setId(rootCapability.getId())
            .build();

          capabilityPayloads.add(capabilityPayload);
        }

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
        Map<String,FObject> capabilityDataObjects = (Map<String,FObject>) receivingCapPayload.getCapabilityDataObjects();
        CrunchService crunchService = (CrunchService) x.get("crunchService");

        if ( ! (receivingCapPayload instanceof SingleCapabilityPayload) ) {
          List grantPath = crunchService.getGrantPath(x, receivingCapPayload.getId());

          // storing the ucjs by looking up the capabilities required from the grantPath and then referencing them in capabilityDataObjects
          int index = 0;
          while ( index < grantPath.size() ) {
            Object item = grantPath.get(index++);

            if ( item instanceof Capability ) {
              Capability cap = (Capability) item;

              // Skip missing capabilities and simply report them missing in the response by calling find_
              if ( capabilityDataObjects == null || ! capabilityDataObjects.containsKey(cap.getName()) )
                continue;

              // Making sure to cast the of to the object before it gets casted to an fobject
              FObject dataObj;
              if ( cap.getOf() != null ) {
                dataObj = (FObject) cap.getOf().getObjClass().cast(capabilityDataObjects.get(cap.getName()));
              } else {
                dataObj = (FObject) capabilityDataObjects.get(cap.getName());
              }

              crunchService.updateJunction(x, cap.getId(), dataObj);
            }
            else if ( item instanceof List ) {
              grantPath.addAll((List) item);
            }
          }
        } else {
          SingleCapabilityPayload singleCapabilityPayload = (SingleCapabilityPayload) receivingCapPayload;
          Capability capability = (Capability) ((DAO) x.get("capabilityDAO")).find(singleCapabilityPayload.getId());
          if ( capability == null ) {
            throw new RuntimeException("Cannot find capability: " + singleCapabilityPayload.getId());
          }

          if ( capabilityDataObjects != null && capabilityDataObjects.containsKey(capability.getName()) ) {
              // Making sure to cast the of to the object before it gets casted to an fobject
              FObject dataObj = ( capability.getOf() != null ) ? 
                (FObject) capability.getOf().getObjClass().cast(capabilityDataObjects.get(capability.getName())) :
                (FObject) capabilityDataObjects.get(capability.getName());
              crunchService.updateJunction(x, capability.getId(), dataObj);
          }
        }

        return find_(x, receivingCapPayload.getId());
      `
    }
  ],
});
