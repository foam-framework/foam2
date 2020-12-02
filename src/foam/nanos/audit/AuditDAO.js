/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.audit',
  name: 'AuditDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.lib.json.Outputter',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'java.util.ArrayList',
    'java.util.Iterator',
    'java.util.List',
    'java.util.Map'
  ],

  properties: [
    {
      class: 'Object',
      name: 'outputter',
      javaType: 'foam.lib.json.Outputter',
      javaFactory: `
        return new Outputter(getX());
      `
    }
  ],

  methods: [
    {
      name: 'formatMessage',
      type: 'String',
      args: [
        { type: 'FObject', name: 'currentValue' },
        { type: 'FObject', name: 'newValue' }
      ],
      documentation: 'Creates a format message containing the list of properties that have changed',
      javaCode: `
        Map          diff   = currentValue.diff(newValue);
        Iterator     i      = diff.keySet().iterator();
        List<String> result = new ArrayList<>();

        while ( i.hasNext() ) {
          String key = (String) i.next();
          result.add(key + ": [" + currentValue.getProperty(key) + "," + diff.get(key) + "]");
        }

        return result.toString();
      `
    },
    {
      name: 'put_',
      javaCode: `
        User    user     = ((Subject) x.get("subject")).getUser();
        Logger  logger   = (Logger) x.get("logger");
        FObject current  = this.find_(x, obj);
        Object  objectId = obj.getProperty("id");

        if ( current == null ) {
          logger.info("CREATE", objectId, user.getId(), getOutputter().toString());
        } else {
          logger.info("CHANGE", objectId, user.getId(), formatMessage(current, obj));
        }

        return super.put_(x, obj);
      `
    },
    {
      name: 'remove_',
      javaCode: `
        User   user     = ((Subject) x.get("subject")).getUser();
        Logger logger   = (Logger) x.get("logger");
        Object objectId = obj.getProperty("id");

        getOutputter().output(obj);
        logger.info("REMOVE", objectId, user.getId(), getOutputter().toString());

        return super.remove_(x, obj);
      `
    }
  ]
});
