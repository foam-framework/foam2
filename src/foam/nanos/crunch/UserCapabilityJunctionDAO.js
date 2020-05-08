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
    'foam.nanos.auth.User',
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
      User user = (User) x.get("user");
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
      
      checkOwnership(x, ucJunction);

      // if the junction is being updated from GRANTED to EXPIRED, put into junctionDAO without checking prereqs and data
      UserCapabilityJunction old = (UserCapabilityJunction) getDelegate().find_(x, ucJunction.getId());
      if ( old != null && old.getStatus() == CapabilityJunctionStatus.GRANTED && ucJunction.getStatus() == CapabilityJunctionStatus.EXPIRED ) 
        return getDelegate().put_(x, ucJunction);

      List<CapabilityCapabilityJunction> prereqJunctions = (List<CapabilityCapabilityJunction>) getPrereqs(x, obj);
      if ( validateData(x, ucJunction) && checkPrereqs(x, ucJunction, prereqJunctions) ) {
        ucJunction.setStatus(CapabilityJunctionStatus.GRANTED);
        saveDataToDAO(x, ucJunction);
        configureJunctionExpiry(x, ucJunction, old);
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
      DAO capabilityDAO = (DAO) x.get("capabilityDAO");
      Capability capability = (Capability) capabilityDAO.find(obj.getTargetId());

      if ( capability.getOf() == null ) return;

      if ( obj.getData() == null ) 
        throw new RuntimeException("UserCapabilityJunction data not submitted for capability: " + capability.getName());
      
      String daoKey = capability.getDaoKey();
      if ( daoKey == null ) return;
      
      DAO dao = (DAO) x.get(daoKey);
      if ( dao == null ) return;

      if ( dao.getOf().getId().equals((obj.getData()).getClassInfo().getId()) ) {
        try {
          dao.put(obj.getData());
        } catch (Exception e) {
          Logger logger = (Logger) x.get("logger");
          logger.debug("Data cannot be added to " + daoKey + " for UserCapabilityJunction object : " + obj.getId() );
        }
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
        }
      ],
      type: 'foam.core.FObject',
      documentation: `Set the expiry of a userCapabilityJunction based on the duration or expiry set on the capability, which
      ever one comes first`,
      javaCode: `
      // Only update the expiry for non-active junctions, i.e., non-expired, non-pending, or granted junctions whose expiry is not yet set
      if ( ( old != null && old.getStatus() == CapabilityJunctionStatus.GRANTED && old.getExpiry() != null ) || obj.getStatus() != CapabilityJunctionStatus.GRANTED ) 
        return obj;

      DAO capabilityDAO = (DAO) x.get("capabilityDAO");
      Capability capability = (Capability) capabilityDAO.find((String) obj.getTargetId());
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
      check the prerequisites of the current capability in the junction. If the user does not have a junction with the 
      prerequisite capability, set a junction between them.
      Returns the list of prerequisiteCapabilityJunctions
      `, 
      javaCode: `
      DAO prerequisiteCapabilityJunctionDAO = (DAO) (x.get("prerequisiteCapabilityJunctionDAO"));

      // get a list of the prerequisite junctions where the current capability is the dependent
      List<CapabilityCapabilityJunction> ccJunctions = (List<CapabilityCapabilityJunction>) ((ArraySink) prerequisiteCapabilityJunctionDAO
      .where(EQ(CapabilityCapabilityJunction.SOURCE_ID, ((UserCapabilityJunction) obj).getTargetId()))
      .select(new ArraySink()))
      .getArray();

      // for each of those junctions, assign the user the prerequisite if the user does not already have it
      for ( CapabilityCapabilityJunction ccJunction : ccJunctions ) {
        UserCapabilityJunction ucJunction = (UserCapabilityJunction) getDelegate().find(AND(
          EQ(UserCapabilityJunction.SOURCE_ID, ((UserCapabilityJunction) obj).getSourceId()),
          EQ(UserCapabilityJunction.TARGET_ID, ((CapabilityCapabilityJunction) ccJunction).getTargetId())));
        if ( ucJunction == null ) {
          UserCapabilityJunction junction = new UserCapabilityJunction();
          junction.setSourceId(((UserCapabilityJunction) obj).getSourceId());
          junction.setTargetId(((CapabilityCapabilityJunction) ccJunction).getTargetId());
          ((DAO) x.get("userCapabilityJunctionDAO")).put_(x, junction);
        }
      }
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
      // for each of those junctions, check if the prerequisite is granted, if not, return false
      for ( CapabilityCapabilityJunction ccJunction : ccJunctions ) {
        Capability cap = (Capability) ((DAO) x.get("capabilityDAO")).find((String) ccJunction.getSourceId());
        if (!cap.getEnabled()) continue;
        UserCapabilityJunction ucJunction = (UserCapabilityJunction) getDelegate().find(AND(
          EQ(UserCapabilityJunction.SOURCE_ID, ((UserCapabilityJunction) obj).getSourceId()),
          EQ(UserCapabilityJunction.TARGET_ID, (String) ccJunction.getTargetId())
        ));
        if ( ucJunction != null && ucJunction.getStatus() != CapabilityJunctionStatus.GRANTED ) return false;
      }
      return true;
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
        }
        return true;
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
  
