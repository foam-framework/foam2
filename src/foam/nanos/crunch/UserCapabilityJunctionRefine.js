/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'UserCapabilityJunctionRefine',
  refines: 'foam.nanos.crunch.UserCapabilityJunction',

  documentation: `
    Model for UserCapabilityJunction, contains the data needed to grant the
    capability to user.
  `,
  
  javaImports: [
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'static foam.nanos.crunch.AssociatedEntity.*'
  ],

  tableColumns: [
    'sourceId',
    'targetId',
    'status',
    // 'created', todo, use createaware instead
    'expiry',
    'gracePeriod',
    'data'
  ],

  sections: [
    { name: 'ucjExpirySection' }
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      section: 'basicInfo'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'sourceId',
      label: 'User'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.crunch.Capability',
      name: 'targetId',
      label: 'Capability',
      tableCellFormatter: function(value, obj, axiom) {
        this.__subSubContext__.capabilityDAO
          .find(value)
          .then((capability) => this.add(capability.name || capability.id))
          .catch((error) => {
            this.add(value);
          });
      }
    },
    {
      name: 'data',
      class: 'foam.core.FObjectProperty',
      of: 'foam.core.FObject',
      documentation: `data for capability.of`,
      view: { class: 'foam.u2.detail.VerticalDetailView' }
    },
    {
      name: 'status',
      class: 'Enum',
      of: 'foam.nanos.crunch.CapabilityJunctionStatus',
      value: foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastUpdatedRealUser',
      documentation: `
        This property is helpful when it's necessary to know which real
        user last changed a capability of an effective user.
      `
    },
    // renewable
    { name: 'isExpired', section: 'ucjExpirySection' },
    { name: 'isRenewable', section: 'ucjExpirySection' },
    { name: 'isInRenewablePeriod', section: 'ucjExpirySection' },
    { name: 'isInGracePeriod', section: 'ucjExpirySection' },
    { name: 'expiry', section: 'ucjExpirySection' },
    { name: 'gracePeriod', section: 'ucjExpirySection' }
  ],

  methods: [

    {
      name: 'saveDataToDAO',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'capability',
          type: 'Capability'
        },
        {
          name: 'putObject',
          type: 'Boolean'
        }
      ],
      javaType: 'foam.core.FObject',
      documentation: `
        We may or may not want to store the data in its own dao, based on the nature of the data.
        For example, if the data for some UserCapabilityJunction is a businessOnboarding object, we may want to store this object in
        the businessOnboardingDAO for easier access.
        If the data on an UserCapabilityJunction should be stored in some DAO, the daoKey should be provided on its corresponding Capability object.
      `,
      javaCode: `
        if ( getData() == null ) 
          throw new RuntimeException("UserCapabilityJunction data not submitted for capability: " + getTargetId());
        
        String daoKey = capability.getDaoKey();
        if ( daoKey == null ) return null;

        DAO dao = (DAO) x.get(daoKey);
        if ( dao == null ) return null;

        FObject objectToSave;                                                  // Identify or create data to go into dao.
        String contextDAOFindKey = (String) capability.getContextDAOFindKey();

        if ( contextDAOFindKey != null && ! contextDAOFindKey.isEmpty() ) {
          if ( contextDAOFindKey.toLowerCase().contains("subject") ) {         // 1- Case if subject lookup
            String[] words = foam.util.StringUtil.split(contextDAOFindKey, '.');
            objectToSave = (FObject) x.get("subject");
            
            if ( objectToSave == null || words.length < 2 )
              throw new RuntimeException("@UserCapabilityJunction capability.contextDAOFindKey not found in context. Please check capability: " + getTargetId() + " and its contextDAOFindKey: " + contextDAOFindKey);
            
            if ( words[1].toLowerCase().equals("user") ) {
              objectToSave = ((Subject) objectToSave).getUser();
            } else if ( words[1].toLowerCase().equals("realuser") ) {
              objectToSave = ((Subject) objectToSave).getRealUser();
            }
            try {
              objectToSave = dao.find(((User)objectToSave).getId());
            } catch(Exception e) {
              throw e;
            }
          } else {                                                              // 2- Case if anything other then subject specified
            objectToSave = (FObject) x.get(contextDAOFindKey);

            if ( objectToSave == null )
              throw new RuntimeException("@UserCapabilityJunction capability.contextDAOFindKey not found in context. Please check capability: " + getTargetId() + " and its contextDAOFindKey: " + contextDAOFindKey);
          }
          // TODO - the try block above that finds objectToSave from dao - should be moved here
          //        however need to work on casting the (FObject)objectToSave to understand objectToSave.getId()
        } else {
          try {                                                                 // 3- Case where contextDAOFindKey not specified:
            // Create new object of DAO type to copy over properties
            objectToSave = (FObject) dao.getOf().newInstance();
          } catch (Exception e) {                                               // 4- default case, try using ucj data directly.
            objectToSave = (FObject) getData();
          }
        }
        if ( dao.getOf().getObjClass().isAssignableFrom(getData().getClass()) ) { // skip copy if data is the same class as dao.of or is a super class of dao.of
          objectToSave = (FObject) getData();
        }
        else {
          objectToSave = objectToSave.fclone().copyFrom(getData());           // finally copy user inputed data into objectToSave <- typed to the safest possibility from above cases
        }

        try {                                                                   // save data to dao
          if ( putObject ) dao.inX(x).put(objectToSave);
        } catch (Exception e) {
          Logger logger = (Logger) x.get("logger");
          logger.warning("Data cannot be added to " + capability.getDaoKey() + " for UserCapabilityJunction object : " + getId() );
        }

        return objectToSave;
      `
    },
    {
      name: 'getSubject',
      type: 'foam.nanos.auth.Subject',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
        UserCapabilityJunction ucj = this;
        var currentSubject = (Subject) x.get("subject");
        var userDAO = (DAO) x.get("userDAO");

        Subject subject = new Subject(x);
        if ( ucj instanceof AgentCapabilityJunction ) {
          subject.setUser((User) userDAO.find(ucj.getSourceId()));
          AgentCapabilityJunction acj = (AgentCapabilityJunction) ucj;
          subject.setUser((User) userDAO.find(acj.getEffectiveUser()));
          return subject;
        }

        // We will need the capability object to know how it's associated
        var capabilityDAO = (DAO) x.get("capabilityDAO");
        var cap = (Capability) capabilityDAO.find(ucj.getTargetId());
        if ( cap == null ) {
          throw new RuntimeException(
            "Tried to call getSubject() on UCJ with unrecognized capability");
        }

        if ( ucj.getSourceId() == currentSubject.getUser().getId() ) {
          subject.setUser(currentSubject.getRealUser());
          subject.setUser(currentSubject.getUser());
          return subject;
        }

        if ( cap.getAssociatedEntity() == USER ) {
          subject.setUser((User) userDAO.find(
            0 != ucj.getLastUpdatedRealUser()
              ? ucj.getLastUpdatedRealUser()
              : ucj.getSourceId()
          ));
          subject.setUser((User) userDAO.find(ucj.getSourceId()));
        }
        
        subject.setUser((User) userDAO.find(ucj.getSourceId()));
        subject.setUser((User) userDAO.find(ucj.getSourceId()));
        return subject;
      `
    }
  ]
});

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'AgentCapabilityJunction',
  extends: 'foam.nanos.crunch.UserCapabilityJunction',

  properties: [
    {
      name: 'effectiveUser',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      documentation: `
        The entity the owner of this capability 'act as'
      `
    }
  ]
})