/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'DAOEmailService',
  extends: 'foam.nanos.notification.email.ProxyEmailService',

  documentation: 'Place generated EmailMessages into a DAO pipeline.',

  imports: [
    'logger?' // Only needed on the Java side
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.NullDAO',
    'foam.nanos.logger.Logger'
  ],

  properties: [
    {
      name: 'dao',
      class: 'foam.dao.DAOProperty',
      javaFactory: `
        initializing.set(true);
        String daoName = "emailMessageDAO";
        Logger logger = (Logger) getLogger();

        logger.log("DAOEmailService initializing " + daoName);

        DAO dao = (DAO) getX().get(daoName);

        if ( dao == null ) {
          logger.error("DAOEmailService DAO not found: " + daoName);
          dao = new NullDAO();
        }

        initializing.set(false);
        return dao;
`
    },
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
            protected ThreadLocal<Boolean> initializing = new ThreadLocal<Boolean>() {
              @Override
              protected Boolean initialValue() {
                return false;
              }
            };
          `
        }));
      }
    }
  ],

  methods: [
    {
      name: 'sendEmail',
      javaCode: `
        getDao().inX(x).put(emailMessage);
        super.sendEmail(x, emailMessage);
      `
    },
    {
      name: 'sendEmailFromTemplate',
      javaCode: `
        getDao().inX(x).put(emailMessage);
        super.sendEmailFromTemplate(x, user, emailMessage, name, templateArgs);
      `
    }
  ]
});
