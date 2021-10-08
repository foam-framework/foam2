/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.lite',
  name: 'CapableDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.util.SafetyUtil',
    'foam.nanos.crunch.CapabilityIntercept',
    'foam.nanos.crunch.lite.Capable',
    'foam.nanos.crunch.CapabilityJunctionPayload',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'java.util.Arrays',
    'java.util.ArrayList',
    'java.util.List'
  ],

  properties: [
    {
      class: 'String',
      name: 'daoKey'
    },
    {
      class: 'Enum',
      name: 'defaultStatus',
      of: 'foam.nanos.crunch.CapabilityJunctionStatus',
      value: foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        FObject currentObjectInDao = getDelegate().find_(x, obj);
        Capable toPutCapableObj =  (Capable) obj;
        DAO toPutCapablePayloadDAO = toPutCapableObj.getCapablePayloadDAO(x);

        CapabilityJunctionPayload[] toPutCapablePayloadArray =
          (CapabilityJunctionPayload[]) toPutCapableObj.getCapablePayloads();

        // For both create and update,
        // we need to handle the cleaning of data if it is from the client
        // and we also need to populate the CapablePayload.daoKey and
        // CapablePayload.objId fields since they don't get filled out by client
        if ( currentObjectInDao == null ) {
          for (int i = 0; i < toPutCapablePayloadArray.length; i++){

            toPutCapableObj.setDAOKey(getDaoKey());

            CapabilityJunctionPayload currentCapablePayload = toPutCapablePayloadArray[i];

            if ( ! currentCapablePayload.getHasSafeStatus() ){
              currentCapablePayload.setStatus(getDefaultStatus());
            }
          }
        } else {
          Capable storedCapableObj = (Capable) currentObjectInDao;

          toPutCapableObj.setDAOKey(storedCapableObj.getDAOKey());

          // should always be sync'd with whatever is on the backend
          if (
            SafetyUtil.isEmpty(String.valueOf(storedCapableObj.getDAOKey()))
          ) {
            toPutCapableObj.setDAOKey(getDaoKey());
          }

          DAO storedCapablePayloadDAO = storedCapableObj.getCapablePayloadDAO(x);

          for ( int i = 0; i < toPutCapablePayloadArray.length; i++ ){
            CapabilityJunctionPayload toPutCapablePayload =
              (CapabilityJunctionPayload) toPutCapablePayloadArray[i];

            if ( ! toPutCapablePayload.getHasSafeStatus() ){

              DAO capabilityDAO = (DAO) x.get("capabilityDAO");
              Capability capability = (Capability) capabilityDAO.find(toPutCapablePayload.getCapability());

              CapabilityJunctionPayload storedCapablePayload = (CapabilityJunctionPayload) storedCapablePayloadDAO.find(capability.getId());

              if ( storedCapablePayload != null ){
                toPutCapablePayload.setStatus(storedCapablePayload.getStatus());
              }
            }
          }
        }

        List<CapabilityJunctionPayload> capablePayloads = new ArrayList<CapabilityJunctionPayload>(Arrays.asList(toPutCapablePayloadArray));

        for ( CapabilityJunctionPayload currentPayload : capablePayloads ){
          toPutCapablePayloadDAO.put(currentPayload);
        }

        if ( 
          ! toPutCapableObj.checkRequirementsStatusNoThrow(x, toPutCapableObj.getCapabilityIds(), CapabilityJunctionStatus.GRANTED) &&
          ! toPutCapableObj.checkRequirementsStatusNoThrow(x, toPutCapableObj.getCapabilityIds(), CapabilityJunctionStatus.PENDING) &&
          ! toPutCapableObj.checkRequirementsStatusNoThrow(x, toPutCapableObj.getCapabilityIds(), CapabilityJunctionStatus.REJECTED)
        ) {
          CapabilityIntercept cre = new CapabilityIntercept();
          cre.setDaoKey(getDaoKey());
          cre.addCapable(toPutCapableObj);
          throw cre;
        }

        return super.put_(x, obj);
      `
    }
  ],
});
