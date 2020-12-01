foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PreventSystemDAO',
  extends: 'foam.dao.ProxyDAO',
  flags: ['java'],
  documentation: `
    Prevents, or warns about, a system context making changes to a DAO intended
    for use within a session context. This is particularly useful when other DAO
    decorators expect a meaningful subject in the context.
  `,

  implements: [
    'foam.nanos.boot.NSpecAware'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmReason',
    'foam.nanos.logger.LogFields',
    'foam.log.LogLevel',
    'foam.nanos.logger.Logger'
  ],

  enums: [
    {
      name: 'PreventionMode',
      values: [
        { name: 'ABORT_REQUEST' },
        { name: 'REDIRECT_REQUEST' },
        { name: 'WARN_ONLY' }
      ]
    }
  ],

  // TODO: remove if InnerEnum supported in Java
  constants: [
    { name: 'ABORT_REQUEST', type: 'Integer', value: 0 },
    { name: 'REDIRECT_REQUEST', type: 'Integer', value: 1 },
    { name: 'WARN_ONLY', type: 'Integer', value: 2 },
    {
      name: 'LOG_MESSAGE',
      type: 'String',
      value: 'Invalid DAO access from a system context'
    }
  ],

  properties: [
    {
      name: 'preventionMode',
      class: 'Int', // TODO: update if InnerEnum supported in Java
      value: 0,
      documentation: `
        Change this to false to allow a system context DAO access, but still
        warn about this behaviouor.
      `
    },
    {
      name: 'localDAOKey',
      class: 'String',
      documentation: `
        When preventionMode is set to REDIRECT_REQUEST, this is the nspec name
        of the DAO the system context should be using - usually localMyDAO for
        a served DAO named myDAO.
      `
    },
    {
      class: 'Enum',
      of: 'foam.log.LogLevel',
      name: 'severity',
      value: 'ERROR'
    },
    {
      name: 'nSpec',
      class: 'FObjectProperty',
      type: 'foam.nanos.boot.NSpec'
    },
    {
      name: 'putName',
      class: 'String',
      javaFactory: 'return getNSpec().getName() + ":put";',
      visibility: 'RO'
    },
    {
      name: 'findName',
      class: 'String',
      javaFactory: 'return getNSpec().getName() + ":find";',
      visibility: 'RO'
    },
    {
      name: 'selectName',
      class: 'String',
      javaFactory: 'return getNSpec().getName() + ":select";',
      visibility: 'RO'
    },
    {
      name: 'removeName',
      class: 'String',
      javaFactory: 'return getNSpec().getName() + ":remove";',
      visibility: 'RO'
    },
    {
      name: 'removeAllName',
      class: 'String',
      javaFactory: 'return getNSpec().getName() + ":removeAll";',
      visibility: 'RO'
    },
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        DAO delegate = checkSystem(x, getPutName());
        if ( delegate != null ) {
          return delegate.put_(x, obj);
        }
        return super.put_(x, obj);
      `
    },
    {
      name: 'find_',
      javaCode: `
        DAO delegate = checkSystem(x, getFindName());
        if ( delegate != null ) {
          return delegate.find_(x, id);
        }
        return super.find_(x, id);
      `
    },
    {
      name: 'select_',
      javaCode: `
        DAO delegate = checkSystem(x, getSelectName());
        if ( delegate != null ) {
          return delegate.select_(x, sink, skip, limit, order, predicate);
        }
        return super.select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'remove_',
      javaCode: `
        DAO delegate = checkSystem(x, getRemoveName());
        if ( delegate != null ) {
          return delegate.remove_(x, obj);
        }
        return super.remove_(x, obj);
      `
    },
    {
      name: 'removeAll_',
      javaCode: `
        DAO delegate = checkSystem(x, getRemoveAllName());
        if ( delegate != null ) {
          delegate.removeAll_(x, skip, limit, order, predicate);
          return;
        }
        super.removeAll_(x, skip, limit, order, predicate);
      `
    },
    {
      name: 'checkSystem',
      type: 'foam.dao.DAO',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'op', type: 'String' }
      ],
      javaCode: `
        var logger = (Logger) x.get("logger");
        var user = ((Subject) x.get("subject")).getUser();
        if ( user.SYSTEM_USER_ID != user.getId() ) {
          return getDelegate();
        }

        var fields = new LogFields();
        fields.put("op", op);

        if ( getPreventionMode() == REDIRECT_REQUEST ) {
          logger.warning(
            LOG_MESSAGE
            + "; redirected to: " + getLocalDAOKey(),
            fields
          );
          return (DAO) x.get(getLocalDAOKey());
        }

        if ( getPreventionMode() == WARN_ONLY ) {
          logger.warning(LOG_MESSAGE, fields);
          return getDelegate();
        }

        // ABORT_REQUEST
        logger.error(LOG_MESSAGE, fields);
        Alarm alarm = new Alarm("Unexpected system context",
          AlarmReason.CONFIGURATION);
        alarm.setSeverity(LogLevel.ERROR);
        alarm.setNote(
          "PreventSystemDAO aborted the following operation: "
          + op);
        ((DAO) x.get("alarmDAO")).put(alarm);
        throw new RuntimeException(
          "Access to DAO from invalid context: " +
          op
        );
      `
    }
  ]
});