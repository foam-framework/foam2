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
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.NullDAO',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Group',
    'foam.util.SafetyUtil',
    'java.nio.charset.StandardCharsets',
    'java.util.List',
    'org.jtwig.environment.EnvironmentConfiguration',
    'org.jtwig.environment.EnvironmentConfigurationBuilder',
    'org.jtwig.JtwigModel',
    'org.jtwig.JtwigTemplate',
    'org.jtwig.resource.loader.TypedResourceLoader'
  ],

  properties: [
    {
      class: 'String',
      name: 'replyTo'
    },
    {
      class: 'String',
      name: 'from'
    },
    {
      class: 'String',
      name: 'displayName'
    },
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
      javaType: 'EnvironmentConfiguration',
      args: [
        {
          name: 'group',
          type: 'String'
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
        getDao().inX(x).put(emailMessage);
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

        JtwigModel model = JtwigModel.newModel(templateArgs);

        emailMessage = fillInEmailProperties(x, emailMessage, emailTemplate, model);

        sendEmail(x, emailMessage);
      `
    },
    {
      name: 'fillInEmailProperties',
      documentation: `
        Prioritiesations:
        1) Properties set on the EmailMessage,
        2) Properties set on the EmailTemplate,
        3) Properties set on the Group,
        4) Properties set as default`,
      type: 'foam.nanos.notification.email.EmailMessage',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'emailMessage',
          javaType: 'final foam.nanos.notification.email.EmailMessage'
        },
        {
          name: 'emailTemplate',
          javaType: 'final foam.nanos.notification.email.EmailTemplate'
        },
        {
          name: 'model',
          javaType: 'org.jtwig.JtwigModel'
        }
      ],
      javaCode: `
        // VARIABLE SET UP:
        // emailMessage = ( EmailMessage) emailMessage.fclone();
        User user      = findUser(x, emailMessage);

        if ( user == null || user.getId() == 0 ) {
          // TODO
          System.out.println("User Error @ DAOEmailService.fillInEmailProperties()");
        }

        EnvironmentConfiguration config = getConfig(user.getGroup());
        DAO groupDAO   = (DAO) x.get("groupDAO");
        Group group    = (Group) groupDAO.find(user.getGroup());

        if ( group == null || group.getId() == "0" ) {
          // TODO
          System.out.println("Group Error @ DAOEmailService.fillInEmailProperties()");
        }

        // BODY:
        JtwigTemplate templateBody = JtwigTemplate.inlineTemplate(emailTemplate.getBody(), config);
        emailMessage.setBody(templateBody.render(model));

        // FROM:
        // The from property is the one property not on emailTemplate
        if ( SafetyUtil.isEmpty(emailMessage.getFrom()) ) {
          emailMessage.setFrom(
            ! SafetyUtil.isEmpty(group.getFrom()) ?
              group.getFrom() : getFrom()
          );
        }

        // REPLY TO:
        if ( SafetyUtil.isEmpty(emailMessage.getReplyTo()) ) {
          if ( ! foam.util.SafetyUtil.isEmpty(emailTemplate.getReplyTo()) ) {
            JtwigTemplate templateDisplayName = JtwigTemplate.inlineTemplate(emailTemplate.getReplyTo(), config);
            emailMessage.setReplyTo(templateDisplayName.render(model));
          } else {
            emailMessage.setReplyTo(
              ! SafetyUtil.isEmpty(group.getReplyTo()) ?
                group.getReplyTo() : getReplyTo()
            );
          }
        }

        // DISPLAY NAME:
        if ( SafetyUtil.isEmpty(emailMessage.getDisplayName()) ) {
          if ( ! foam.util.SafetyUtil.isEmpty(emailTemplate.getDisplayName()) ) {
            JtwigTemplate templateDisplayName = JtwigTemplate.inlineTemplate(emailTemplate.getDisplayName(), config);
            emailMessage.setDisplayName(templateDisplayName.render(model));
          } else {
            emailMessage.setDisplayName(
              ! SafetyUtil.isEmpty(group.getDisplayName()) ? group.getDisplayName() : getDisplayName()
            );
          }
        }

        // SUBJECT:
        // Since subject is very specific to each email there is no group field or default value for this property.
        if ( foam.util.SafetyUtil.isEmpty(emailMessage.getSubject()) &&
          ! foam.util.SafetyUtil.isEmpty(emailTemplate.getSubject()) ) {
            JtwigTemplate templateSubject = JtwigTemplate.inlineTemplate(emailTemplate.getSubject(), config);
            emailMessage.setSubject(templateSubject.render(model));
        }

        // SEND TO:
        // Since sendTo is very specific to each email there is no group field or default value for this property.
        if ( emailMessage.getTo().length == 0 &&
          ! foam.util.SafetyUtil.isEmpty(emailTemplate.getSendTo()) ) {
            JtwigTemplate templateSendTo= JtwigTemplate.inlineTemplate(emailTemplate.getSendTo(), config);
            emailMessage.setTo(new String[] {templateSendTo.render(model)});
        }

        return emailMessage;
      `
    },
    {
      name: 'findUser',
      type: 'foam.nanos.auth.User',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'emailMessage',
          javaType: 'final foam.nanos.notification.email.EmailMessage'
        }
      ],
      javaCode:
        `
        foam.nanos.session.Session session = x.get(foam.nanos.session.Session.class);

        DAO userDAO         = (DAO) x.get("localUserDAO");
        User user           = (User) userDAO.find(session.getUserId());

        // 1. If the user doesn't login at this time, get the user from localUserDao
        // 2. If the user is the system user, get the real user from localUserDao
        if ( user == null || user.getId() == 1 ) {

          Sink sink = new ArraySink();
          sink = userDAO.where(MLang.EQ(User.EMAIL, emailMessage.getTo()[0]))
            .limit(1).select(sink);

          List list = ((ArraySink) sink).getArray();
          if ( list == null || list.size() == 0 ) {
            throw new RuntimeException("User not found");
          }

          user = (User) list.get(0);
          if ( user == null ) {
            throw new RuntimeException("User not found");
          }
        }

        return user;
      `
    }
  ]
});
