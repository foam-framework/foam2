/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'DAOEmailService',

  documentation: 'Place generated EmailMessages into a DAO pipeline.',

  implements: [
    'foam.nanos.notification.email.EmailService'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.NullDAO',
    'java.nio.charset.StandardCharsets',
    'org.jtwig.environment.EnvironmentConfiguration',
    'org.jtwig.environment.EnvironmentConfigurationBuilder',
    'org.jtwig.JtwigModel',
    'org.jtwig.JtwigTemplate',
    'org.jtwig.resource.loader.TypedResourceLoader'
  ],

  properties: [
    {
      name: 'dao',
      class: 'foam.dao.DAOProperty',
      javaFactory: `
        initializing.set(true);
        String daoName = "emailMessageDAO";
        System.out.println("DAOEmailService initializing "+daoName);
        DAO dao = (DAO) getX().get(daoName);
        if ( dao == null ) {
          System.err.println("DAOEmailService DAO not found: "+daoName);
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
          data:
          `
            protected ThreadLocal<Boolean> initializing = new ThreadLocal<Boolean>() {
              @Override
              protected Boolean initialValue() {
                return false;
              }
            };

            protected EnvironmentConfiguration config_ = null;
`
        }));
      }
    }
  ],

  methods: [
    {
      name: 'getConfig',
      javaReturns: 'EnvironmentConfiguration',
      args: [
        {
          name: 'group',
          javaType: 'String'
        }
      ],
      javaCode:
`if ( config_ == null ) {
  config_ = EnvironmentConfigurationBuilder
    .configuration()
    .resources()
      .resourceLoaders()
        .add(new TypedResourceLoader("dao", new DAOResourceLoader(getX(), group)))
      .and()
    .and()
  .build();
}
return config_;`
    },
    {
      name: 'sendEmail',
      javaCode: `
        getDao().put(emailMessage);
`
    },
    {
      name: 'sendEmailFromTemplate',
      javaCode: `
String group = user != null ? (String) user.getGroup() : null;
EmailTemplate emailTemplate = DAOResourceLoader.findTemplate(getX(), name, group);
if ( emailMessage == null )
  return;

for ( String key : templateArgs.keySet() ) {
  Object value = templateArgs.get(key);
  if ( value instanceof String ) {
    String s = (String) value;
    templateArgs.put(key, new String(s.getBytes(StandardCharsets.ISO_8859_1), StandardCharsets.UTF_8));
  }
}

EnvironmentConfiguration config = getConfig(group);
JtwigTemplate template = JtwigTemplate.inlineTemplate(emailTemplate.getBody(), config);
JtwigModel model = JtwigModel.newModel(templateArgs);
emailMessage = (EmailMessage) emailMessage.fclone();
emailMessage.setSubject(emailTemplate.getSubject());
emailMessage.setBody(template.render(model));
sendEmail(emailMessage);
`
    }
  ]
});
