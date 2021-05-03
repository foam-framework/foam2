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
    'foam.core.*',
    'foam.dao.*',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.order.Comparator',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.connection.CapabilityPayload',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger', 
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.pm.PM',
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

  messages: [
    { name: 'PENDING_APPROVAL', message: 'Capability pending approval' }
  ],

  properties: [
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      transient: true,
      visibility: 'HIDDEN',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public CapabilityPayloadDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
          } 

          private Map<String, GrantPathNode> walkGrantPath(List grantPath, X x) {
            DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
            var capabilityDAO = (DAO) x.get("capabilityDAO");
            var userId = ((Subject)x.get("subject")).getRealUser().getId();
            var businessId = ((Subject)x.get("subject")).getUser().getId();

            // Collect all capabilities that belong to either the user or business
            Map<String, UserCapabilityJunction> capabilityUcjMap = new HashMap<String, UserCapabilityJunction>();
            ((ArraySink) userCapabilityJunctionDAO.where(
              OR(
                EQ(UserCapabilityJunction.SOURCE_ID, userId),
                EQ(UserCapabilityJunction.SOURCE_ID, businessId)
              )
            ).select(new ArraySink())).getArray().forEach((item) -> {
              var ucj = (UserCapabilityJunction) item;
              var capability = (Capability) capabilityDAO.find(ucj.getTargetId());
              if ( capability != null )
                capabilityUcjMap.put(capability.getName(), ucj);
            });
      
            int index = 0;
            Map<String,GrantPathNode> capabilityGrantPath = new HashMap<>();
            
            while ( index < grantPath.size() )
            {
              Object item = grantPath.get(index++);

              if ( item instanceof Capability ) {
                Capability capability = (Capability) item;
                UserCapabilityJunction ucj = capabilityUcjMap.get(capability.getName());
                FObject data = null;
                if ( capability.getOf() != null ){
                  try {
                    data = ( ucj != null ) ? ucj.getData() : null;
                    if ( data == null )
                      data = (FObject) capability.getOf().newInstance();
                  } catch (java.lang.Exception e){
                    throw new RuntimeException(e);
                  }
                }
                GrantPathNode node = new GrantPathNode.Builder(x)
                  .setCapability(capability)
                  .setUcj(ucj)
                  .setData(data)
                  .build();
                capabilityGrantPath.put(capability.getName(), node);
              }
              else if ( item instanceof List ) {
                List list = (List) item;

                // add all the elements of the list
                grantPath.addAll(list);
              }
            }

            return capabilityGrantPath;
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
          Map<String,GrantPathNode> dataMap = walkGrantPath(grantPath, x);

          // Sorted maps for return data
          Map<String,FObject> dataObjects = new TreeMap<String,FObject>();
          Map<String,String> validationErrors = new TreeMap<String,String>();
          
          // Validate any of the existing data objects
          for ( var key : dataMap.keySet() ) {
            GrantPathNode node = dataMap.get(key);
            FObject data = node.getData();
            
            // Only return the non-null data objects
            if ( data != null ) {
              dataObjects.put(key, data);

              // Check to see if there are validation erros blocking granting these capabilities
              if ( data instanceof Validatable ) {
                try {
                  ((Validatable) data).validate(x); 
                  
                  // Check for pending approvals on data that passes validation
                  UserCapabilityJunction ucj = node.getUcj();
                  if ( ucj != null && ucj.getStatus() == CapabilityJunctionStatus.PENDING ) {
                    validationErrors.put(key, PENDING_APPROVAL);
                  }
                }
                catch (IllegalStateException | IllegalArgumentException ie) {
                  validationErrors.put(key, ie.getMessage());
                } catch (ValidationException ve) {
                  validationErrors.put(
                    String.format("%s[%s]", key, ve.getPropName()), 
                    ve.getErrorMessage());
                } catch (CompoundException ce) {
                  for ( var t : ce.getExceptions() ) {
                    if ( t instanceof ValidationException ) {
                      var ve = (ValidationException) t;
                      validationErrors.put(
                        String.format("%s[%s]", key, ve.getPropName()),
                        ve.getErrorMessage());
                    }
                  }
                } catch (Throwable t) {
                  getLogger().warning("Unexpected exception validating " + key + ": ", t);
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
      var pm = new PM(CapabilityPayloadDAO.getOwnClassInfo().getId(), "put");

      try {
        CapabilityPayload receivingCapPayload = (CapabilityPayload) obj;
        Map<String,FObject> capabilityDataObjects = (Map<String,FObject>) receivingCapPayload.getCapabilityDataObjects();

        // Retrieve the current set
        CapabilityPayload currentCapPayload = (CapabilityPayload) find_(x, receivingCapPayload.getId());
        Map<String,FObject> currentCapabilityDataObjects = (Map<String,FObject>) currentCapPayload.getCapabilityDataObjects();

        List grantPath = ((CrunchService) x.get("crunchService")).getGrantPath(x, receivingCapPayload.getId());
        processCapabilityList(x, grantPath, capabilityDataObjects, currentCapabilityDataObjects);

        var ret =  find_(x, receivingCapPayload.getId());
        return ret;
      } catch(Throwable t) {
        pm.error(x, t.getMessage());
        throw t;
      } finally {
        pm.log(x);
      }
      `
    },
    {
      name: 'processCapabilityList',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'list', type: 'List' },
        { name: 'capabilityDataObjects', type: 'Map' },
        { name: 'currentCapabilityDataObjects', type: 'Map' }
      ],
      javaCode: `
        for (Object item : list) {
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
            
            UserCapabilityJunction ucj = (UserCapabilityJunction) ((CrunchService) x.get("crunchService")).updateJunction(x, cap.getId(), dataObj, null);
            getLogger().debug(
              "Updated capability: " + cap.getName() + " - " + cap.getId(), 
              "Status: " + ucj.getStatus(), 
              "Source: " + ((ucj.findSourceId(x) != null) ? ucj.getSourceId() + " - " + ucj.findSourceId(x).toSummary() : ucj.getSourceId()));
          } else if ( item instanceof List ) {
            processCapabilityList(x, (List) item, capabilityDataObjects, currentCapabilityDataObjects);
          } else {
            getLogger().warning("Ignoring unexpected item in grant path " + item);
          }
        }
      `
    }
  ],
});
