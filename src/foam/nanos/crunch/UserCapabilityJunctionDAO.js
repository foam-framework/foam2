/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'UserCapabilityJunctionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Authenticated DAO decorator to only show capabilities owned by a user. Updates can only be performed by system.`,

  javaImports: [
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.*',
    'foam.nanos.logger.Logger',

    'java.util.Calendar',
    'java.util.Date',
    'java.util.List',

    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'getUser',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'foam.nanos.auth.User',
      javaCode: `
      User user = ((Subject) x.get("subject")).getUser();
      if ( user == null ) throw new AuthenticationException("user not found");
      return user;
      `
    },
    {
      name: 'checkOwnership',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.nanos.crunch.UserCapabilityJunction'
        }
      ],
      documentation: `Check if current user has permission to add this junction`,
      javaCode: `
        User user = getUser(x);
        User agent = (User) x.get("agent");
        AuthService auth = (AuthService) x.get("auth");
        boolean isOwner = obj.getSourceId() == user.getId() || ( agent != null && obj.getSourceId() == agent.getId() );
        if ( ! isOwner && ! auth.check(x, "*") ) throw new AuthorizationException();
      `
    },
    {
      name: 'getFilteredDAO',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'foam.dao.DAO',
      documentation: `Return list of junctions the current user has read access to`,
      javaCode: `
      User user = getUser(x);
      AuthService auth = (AuthService) x.get("auth");
      if ( auth.check(x, "service.*") ) return getDelegate();
      return getDelegate().where(
        EQ(UserCapabilityJunction.SOURCE_ID, user.getId())
      );
      `
    },
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      type: 'foam.core.FObject',
      documentation: `
      Set the status of the junction before putting by checking if prerequisites are fulfilled and data required is validated.
      If status is set to GRANTED, check if junctions depending on current can be granted
      `,
      javaCode: `
      UserCapabilityJunction ucJunction = (UserCapabilityJunction) obj;

      DAO capabilityDAO = (DAO) x.get("capabilityDAO");
      Capability capability = (Capability) capabilityDAO.find_(x, ucJunction.getTargetId());

      checkOwnership(x, ucJunction);

      // if the junction is being updated from GRANTED to EXPIRED, put into junctionDAO without checking prereqs and data
      UserCapabilityJunction old = (UserCapabilityJunction) getDelegate().find_(x, ucJunction.getId());
      if ( old != null && old.getStatus() == CapabilityJunctionStatus.GRANTED && ucJunction.getStatus() == CapabilityJunctionStatus.EXPIRED )
        return getDelegate().put_(x, ucJunction);

      List<CapabilityCapabilityJunction> prereqJunctions = (List<CapabilityCapabilityJunction>) getPrereqs(x, obj);

      boolean requiresData = capability.getOf() != null;

      if ( ( ! requiresData || ( ucJunction.getData() != null && validateData(x, ucJunction)) ) && checkPrereqs(x, ucJunction, prereqJunctions) ) {
        ucJunction.setStatus(CapabilityJunctionStatus.GRANTED);
        if ( requiresData && capability.getDaoKey() != null ) saveDataToDAO(x, capability, ucJunction);
        configureJunctionExpiry(x, ucJunction, old, capability);
      }
      else ucJunction.setStatus(CapabilityJunctionStatus.PENDING);

      return getDelegate().put_(x, obj);

      `
    },
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
          name: 'obj',
          type: 'foam.nanos.crunch.UserCapabilityJunction'
        }
      ],
      documentation: `
      We may or may not want to store the data in its own dao, based on the nature of the data.
      For example, if the data for some UserCapabilityJunction is a businessOnboarding object, we may want to store this object in
      the businessOnboardingDAO for easier access.
      If the data on an UserCapabilityJunction should be stored in some DAO, the daoKey should be provided on its corresponding Capability object.
      `,
      javaCode: `
      if ( obj.getData() == null ) 
        throw new RuntimeException("UserCapabilityJunction data not submitted for capability: " + obj.getTargetId());
      
      String daoKey = capability.getDaoKey();
      if ( daoKey == null ) return;

      DAO dao = (DAO) x.get(daoKey);
      if ( dao == null ) return;

      // Identify or create data to go into dao.
      FObject objectToSave;
      String contextDAOFindKey = (String)capability.getContextDAOFindKey();
      if ( contextDAOFindKey != null && ! contextDAOFindKey.isEmpty() ) {
        objectToSave = (FObject) x.get(contextDAOFindKey);
        if ( objectToSave == null ) {
          throw new RuntimeException("@UserCapabilityJunction capability.contextDAOFindKey not found in context. Please check capability: " + obj.getTargetId() + " and its contextDAOKey: " + capability.getContextDAOFindKey());
        }
      } else {
        try {
          objectToSave = (FObject) dao.getOf().newInstance();
        } catch (Exception e) {
          objectToSave = (FObject) obj.getData();
        }

      }
      objectToSave = objectToSave.fclone().copyFrom(obj.getData());

      // save data to dao
      try {
        dao.put(objectToSave);
      } catch (Exception e) {
        Logger logger = (Logger) x.get("logger");
        logger.debug("Data cannot be added to " + capability.getDaoKey() + " for UserCapabilityJunction object : " + obj.getId() );
      }
      `
    },
    {
      name: 'configureJunctionExpiry',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.nanos.crunch.UserCapabilityJunction'
        },
        {
          name: 'old',
          type: 'foam.nanos.crunch.UserCapabilityJunction'
        },
        {
          name: 'capability',
          type: 'foam.nanos.crunch.Capability'
        }
      ],
      type: 'foam.core.FObject',
      documentation: `Set the expiry of a userCapabilityJunction based on the duration or expiry set on the capability, which
      ever one comes first`,
      javaCode: `
      // Only update the expiry for non-active junctions, i.e., non-expired, non-pending, or granted junctions whose expiry is not yet set
      if ( ( old != null && old.getStatus() == CapabilityJunctionStatus.GRANTED && old.getExpiry() != null ) || obj.getStatus() != CapabilityJunctionStatus.GRANTED )
        return obj;

      Date junctionExpiry = capability.getExpiry();

      if ( capability.getDuration() > 0 ) {
        Date today = new Date();
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(today);
        calendar.add(Calendar.DATE, capability.getDuration());

        if ( junctionExpiry == null ) {
          junctionExpiry = calendar.getTime();
        } else {
          junctionExpiry = junctionExpiry.after(calendar.getTime()) ? calendar.getTime() : junctionExpiry;
        }
      }
      obj.setExpiry(junctionExpiry);
      return obj;
      `
    },
    {
      name: 'getPrereqs',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      javaType: 'java.util.List<CapabilityCapabilityJunction>',
      documentation: `
      Returns the list of prerequisiteCapabilityJunctions for the target capability of the ucj
      `, 
      javaCode: `
      DAO prerequisiteCapabilityJunctionDAO = (DAO) (x.get("prerequisiteCapabilityJunctionDAO"));

      // get a list of the prerequisite junctions where the current capability is the dependent
      List<CapabilityCapabilityJunction> ccJunctions = (List<CapabilityCapabilityJunction>) ((ArraySink) prerequisiteCapabilityJunctionDAO
      .where(EQ(CapabilityCapabilityJunction.SOURCE_ID, ((UserCapabilityJunction) obj).getTargetId()))
      .select(new ArraySink()))
      .getArray();

      return ccJunctions;

      `
    },
    {
      name: 'checkPrereqs',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        },
        {
          name: 'ccJunctions',
          javaType: 'java.util.List<CapabilityCapabilityJunction>'
        }
      ],
      type: 'Boolean',
      documentation: `Check if prerequisites of a capability is fulfilled`,
      javaCode: `
      boolean prerequisitesFulfilled = true;

      // for each of those junctions, check if the prerequisite is granted, if not, return false
      UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
      for ( CapabilityCapabilityJunction ccJunction : ccJunctions ) {
        Capability cap = (Capability) ((DAO) x.get("capabilityDAO")).find((String) ccJunction.getSourceId());
        if ( ! cap.getEnabled() ) continue;
        UserCapabilityJunction ucJunction = (UserCapabilityJunction) getDelegate().find(AND(
          EQ(UserCapabilityJunction.SOURCE_ID, ucj.getSourceId()),
          EQ(UserCapabilityJunction.TARGET_ID, (String) ccJunction.getTargetId())
        ));
        if ( ucJunction == null || ucJunction.getStatus() != CapabilityJunctionStatus.GRANTED ) {
          // if ucJunction is null, create a ucj and put to ucjDAO
          // if ucJunction exists but is not granted, try to re-put the ucj
          ucJunction = ucJunction == null ? 
            new UserCapabilityJunction.Builder(x)
              .setSourceId(ucj.getSourceId())
              .setTargetId(ccJunction.getTargetId())
              .build() :
            ucJunction;
          try {
            ucJunction = (UserCapabilityJunction) ((DAO) x.get("userCapabilityJunctionDAO")).put_(x, ucJunction);
          } catch ( RuntimeException e ) {
            prerequisitesFulfilled = false;
          }
          if ( ucJunction == null || ucJunction.getStatus() != CapabilityJunctionStatus.GRANTED )
            prerequisitesFulfilled = false;
        }
      }
      return prerequisitesFulfilled;
      `
    },
    {
      name: 'validateData',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      type: 'Boolean',
      documentation: `call the validate method on data and if not "return true" then set the junction status to pending`,
      javaCode: `
        FObject data = ((UserCapabilityJunction) obj).getData();
        if ( data != null ) {
          try {
            data.validate(x);
          } catch(Exception e) {
            return false;
          }
          return true;
        }
        return false;
      `
    },
    {
      name: 'remove_',
      javaCode: `
      checkOwnership(x, (UserCapabilityJunction) obj);
      return super.remove_(x, obj);
      `
    },
    {
      name: 'removeAll_',
      javaCode: `
      DAO dao = getFilteredDAO(x);
      dao.removeAll_(x, skip, limit, order, predicate);
      `
    },
    {
      name: 'select_',
      javaCode: `
      DAO dao = getFilteredDAO(x);
      return dao.select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'find_',
      javaCode:`
      FObject result = super.find_(x, id);
      if ( result != null ) checkOwnership(x, (UserCapabilityJunction) result);
      return result;
      `
    }
  ]
});
