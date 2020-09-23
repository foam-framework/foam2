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
    'foam.core.Validatable',
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
    'foam.nanos.logger.Logger',
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
                List list = (List) item;

                // add all the elements of the list
                grantPath.addAll(list);
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

        return filterCapabilityPayload(x, idToString);
      `
    },
    {
      name: 'select_',
      javaCode: `

        // grabbing actual capabilities based on the capabilities given in select
        DAO localCapabilityDAO = (DAO) x.get("localCapabilityDAO");
        List<Capability> rootCapabilities = ((ArraySink) localCapabilityDAO.select_(
            x, new ArraySink(), skip, limit, order, predicate
          )).getArray();

        CrunchService crunchService = (CrunchService) x.get("crunchService");

        // if separate capability ids submitted in select which aree part of different subtrees
        List<CapabilityPayload> capabilityPayloads = new ArrayList<>();
      
        // iterate through each capability from the select and calculate separate grant path
        for ( Capability rootCapability : rootCapabilities ){
          CapabilityPayload capabilityPayload = filterCapabilityPayload(x, rootCapability.getId());
          capabilityPayloads.add(capabilityPayload);
        }

        ArraySink capabilityPayloadsToArraySink = new ArraySink.Builder(x)
          .setArray(new ArrayList(capabilityPayloads))
          .build();
        
        return capabilityPayloadsToArraySink;
      `
    },
    {
      name: 'filterCapabilityPayload',
      type: 'CapabilityPayload',
        args: [
          { name: 'x', type: 'Context' },
          { name: 'id', type: 'String' }
        ],
        javaCode: `
          CrunchService crunchService = (CrunchService) x.get("crunchService");
          List grantPath = crunchService.getGrantPath(x, id);
          Map<String,FObject> dataMap = walkGrantPath(grantPath, x);

          // Sorted maps for return data
          Map<String,FObject> dataObjects = new TreeMap<String,FObject>();
          Map<String,String> validationErrors = new TreeMap<String,String>();
          
          // Validate any of the existing data objects
          for ( var key : dataMap.keySet() ) {
            FObject data = dataMap.get(key);
            
            // Only return the non-null data objects
            if ( data != null ) {
              dataObjects.put(key, data);

              // Check to see if there are validation erros blocking granting these capabilities
              if ( data instanceof Validatable ) {
                try { ((Validatable) data).validate(x); }
                catch (IllegalStateException ise) {
                  validationErrors.put(key, ise.getMessage());
                } catch (IllegalArgumentException iae) {
                  validationErrors.put(key, iae.getMessage());
                } catch (Throwable t) {
                  Logger logger = (Logger) x.get("logger");
                  logger.warning("Unexpected exception validating " + key + ": ", t);
                }
              }
            }
          }

          return new CapabilityPayload.Builder(x)
            .setCapabilityDataObjects(dataObjects)
            .setCapabilityValidationErrors(validationErrors)
            .setId(id)
            .build();
        `
    },
    {
      name: 'put_',
      javaCode: `
        CapabilityPayload receivingCapPayload = (CapabilityPayload) obj;
        Map<String,FObject> capabilityDataObjects = (Map<String,FObject>) receivingCapPayload.getCapabilityDataObjects();

        // Retrieve the current set
        CapabilityPayload currentCapPayload = (CapabilityPayload) find_(x, receivingCapPayload.getId());
        Map<String,FObject> currentCapabilityDataObjects = (Map<String,FObject>) null; // currentCapPayload.getCapabilityDataObjects();

        CrunchService crunchService = (CrunchService) x.get("crunchService");

        List grantPath = crunchService.getGrantPath(x, receivingCapPayload.getId());

        // storing the ucjs by looking up the capabilities required from the grantPath and then referencing them in capabilityDataObjects
        int index = 0;
        while ( index < grantPath.size() ) {
          Object item = grantPath.get(index++);

          if ( item instanceof Capability ) {
            Capability cap = (Capability) item;

            FObject currentDataObj = null;
            if ( currentCapabilityDataObjects != null && currentCapabilityDataObjects.containsKey(cap.getName()))
            {
              currentDataObj = ( cap.getOf() != null ) ? 
                (FObject) cap.getOf().getObjClass().cast(currentCapabilityDataObjects.get(cap.getName())) :
                (FObject) capabilityDataObjects.get(cap.getName());
            }

            FObject dataObj = null;
            if ( capabilityDataObjects != null && capabilityDataObjects.containsKey(cap.getName()) ) {
              // Making sure to cast the of to the object before it gets casted to an fobject
              dataObj = ( cap.getOf() != null ) ?
                (FObject) cap.getOf().getObjClass().cast(capabilityDataObjects.get(cap.getName())) :
                (FObject) capabilityDataObjects.get(cap.getName());  
            }

            if ( currentDataObj != null ) {
              // copy any new values from the new data object into the current object
              if ( dataObj != null) {
                currentDataObj.copyFrom(dataObj);
              }
              dataObj = currentDataObj;
            } 
            
            crunchService.updateJunction(x, cap.getId(), dataObj);
          }
          else if ( item instanceof List ) {
            List list = (List) item;

            // add all the elements of the list
            grantPath.addAll(list);
          }
        }

        return find_(x, receivingCapPayload.getId());
      `
    }
  ],
});
