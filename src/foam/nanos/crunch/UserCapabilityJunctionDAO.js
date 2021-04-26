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
    'foam.dao.DAO',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmReason',
    'foam.nanos.auth.*',
    'static foam.mlang.MLang.*'
  ],

  messages: [
    { name: 'ERROR_ONE', message: 'UserCapabilityJunctions should be disabled via LifecycleState change.' },
    { name: 'ERROR_TWO', message: 'User\'s capability cannot be reassigned.' },
    { name: 'ERROR_THREE', message: 'Capability cannot be changed.' },
    { name: 'ERROR_FOUR', message: 'Capability data type mismatch ' },
    { name: 'ERROR_CAPABILITY_NOT_FOUND', message: 'Capability not found ' }
  ],

  constants: [
    {
      name: 'TARGET_CAPABILITY_ID_CHANGE',
      type: 'String',
      value: 'usercapabilityjunction.update.targetid'
    },
    {
      name: 'SOURCE_CAPABILITY_ID_CHANGE',
      type: 'String',
      value: 'usercapabilityjunction.update.sourceid'
    }
  ],

  methods: [
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
        Subject subject = (Subject) x.get("subject");
        User user = subject.getUser();
        User realUser = subject.getRealUser();

        AuthService auth = (AuthService) x.get("auth");
        boolean isOwner = obj.getSourceId() == user.getId() || obj.getSourceId() == realUser.getId();
        if ( ! isOwner && ! auth.check(x, "usercapabilityjunction.read.*") ) throw new AuthorizationException();
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
      Subject subject = (Subject) x.get("subject");
      User user = (User) subject.getUser();
      User realUser = (User) subject.getRealUser();

      AuthService auth = (AuthService) x.get("auth");
      if ( auth.check(x, "*") ) return getDelegate();
      return getDelegate().where(
        OR(
          EQ(UserCapabilityJunction.SOURCE_ID, user.getId()),
          EQ(UserCapabilityJunction.SOURCE_ID, realUser.getId())
        )
      );
      `
    },
    {
      name: 'remove_',
      javaCode: `
        throw new UnsupportedOperationException(this.ERROR_ONE);
      `
    },
    {
      name: 'removeAll_',
      javaCode: `
        throw new UnsupportedOperationException(this.ERROR_ONE);
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
      javaCode: `
        FObject result = super.find_(x, id);
        if ( result != null ) checkOwnership(x, (UserCapabilityJunction) result);
        return result;
      `
    },
    {
      name: 'put_',
      javaCode: `
        UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
        UserCapabilityJunction old = (UserCapabilityJunction) super.find_(x, ucj.getId());

        // do not allow updates to sourceId/targetId properties
        AuthService auth = (AuthService) x.get("auth");
        if ( old != null && ucj.getSourceId() != old.getSourceId() && ! auth.check(x, SOURCE_CAPABILITY_ID_CHANGE) ) throw new RuntimeException(this.ERROR_TWO);
        if ( old != null && ! ucj.getTargetId().equals(old.getTargetId()) && ! auth.check(x, TARGET_CAPABILITY_ID_CHANGE) ) throw new RuntimeException(this.ERROR_THREE);

        // if ucj data is set but does not match expected data, do not put
        Capability capability = (Capability) ucj.findTargetId(x);
        if ( capability == null ||
             ( ! ( capability.getOf() == null || ucj.getData() == null ) &&
               ! ( ucj.getData().getClassInfo().equals(capability.getOf()) )
             )
           ) {
          Alarm alarm = new Alarm("CRUNCH Configuration", AlarmReason.CONFIGURATION);
          alarm.setSeverity(foam.log.LogLevel.ERROR);
          alarm.setNote(this.ERROR_FOUR + ucj.getTargetId());

          foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");

          if ( capability == null ) {
            logger.error(this.getClass().getSimpleName(), "Capability not found", ucj.getTargetId());
            alarm.setNote(this.ERROR_CAPABILITY_NOT_FOUND + ucj.getTargetId());
          } else if ( capability.getOf() != null &&
                      ucj.getData() != null ) {
            logger.error(this.getClass().getSimpleName(), "Type mismatch", "capability", capability.getId(), "expected", capability.getOf().getId(), "received", ucj.getData().getClassInfo().getId());
          }
          ((DAO) x.get("alarmDAO")).put(alarm);
          throw new RuntimeException(alarm.getNote());
        }

        return super.put_(x, obj);
      `
    }
  ]
});
