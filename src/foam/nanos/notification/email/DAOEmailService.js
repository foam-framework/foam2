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

  imports: [
    'logger?'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.NullDAO',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Group',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.email.EmailTemplate',
    'foam.util.SafetyUtil',
    'java.nio.charset.StandardCharsets',
    'java.util.List',
    'org.jtwig.environment.EnvironmentConfiguration',
    'org.jtwig.environment.EnvironmentConfigurationBuilder',
    'org.jtwig.JtwigModel',
    'org.jtwig.JtwigTemplate',
    'org.jtwig.resource.loader.TypedResourceLoader',
    'static foam.mlang.MLang.*'
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
      `
      if ( config_ == null ) {
        config_ = EnvironmentConfigurationBuilder
          .configuration()
          .resources()
            .resourceLoaders()
              .add(new TypedResourceLoader("dao", new DAOResourceLoader(getX(), group)))
            .and()
          .and()
        .build();
      }
      return config_;
      `
    },
    {
      name: 'sendEmail',
      javaCode: `
        getDao().inX(x).put(emailMessage);
      `
    },
    {
      name: 'sendEmailFromTemplate',
      documentation: `Purpose of this function/service is to facilitate the populations of an email and then to actually send the email. 
      STEP 1) find the EmailTemplate,
      STEP 2) apply the template to the emailMessage,
      STEP 3) set defaults to emailMessage where property is empty,
      STEP 4) then to store and send the email we just have to do a dao.put.
      `,
      javaCode: `
        EmailTemplate emailTemplateObj = null;

        if ( user == null && (emailMessage == null || SafetyUtil.isEmpty(emailMessage.getTo()[0]) ) ) {
          ((Logger)getLogger()).warning("user and emailMessage.getTo() is not set. Email can't magically know where to go.", new Exception());
          return;
        }

        EnvironmentConfiguration config = getConfig(user.getGroup());

        if ( ! SafetyUtil.isEmpty(name) && user != null) {

          // STEP 1) Find EmailTemplate
          emailTemplateObj = DAOResourceLoader.findTemplate(getX(), name, user.getGroup());
          if ( emailMessage == null ) {
            if ( emailTemplateObj != null ) {
              emailMessage = new EmailMessage();
            } else {
              ((Logger)getLogger()).warning("emailTemplate not found and emailMessage is null. Invalid use of emailService", new Exception());
              return;
            }
          }
        } else {
          if ( emailMessage == null ) {
            // no template specified and no emailMessage means nothing to send.
            ((Logger)getLogger()).warning("emailTemplate name missing and emailMessage is null. Invalid use of emailService", new Exception());
            return;
          }
        }

        // emailMessage not null if we have reached here

        // Possible that emailTemplateObj is null and emailMessage was passed in for sending, without the use of a template.
        // in this case bypass step 2.
        if ( emailTemplateObj != null) {

          // STEP 2) Apply Template to emailMessage

          try {
            emailMessage = emailTemplateObj.apply(x, user, emailMessage, templateArgs, config);
            if ( emailMessage == null) {
              ((Logger)getLogger()).warning("emailTemplate.apply has returned null. Which implies an uncaught error", new Exception());
            }
          } catch (Exception e) {
            ((Logger)getLogger()).warning("emailTemplate.apply has failed, with a caught exception", e);
            return;
          }
        }

        // STEP 3) set defaults to properties that have not been set

        if ( SafetyUtil.isEmpty(emailMessage.getFrom()) ) {
          emailMessage.setFrom(getFrom());
        }
        if ( SafetyUtil.isEmpty(emailMessage.getDisplayName()) ) {
          emailMessage.setDisplayName(getDisplayName());
        }
        if ( SafetyUtil.isEmpty(emailMessage.getReplyTo()) ) {
          emailMessage.setReplyTo(getReplyTo());
        }

        // STEP 4) Pass populated emailMessage through email pipeline 
        sendEmail(x, emailMessage);
      `
      }
  ]
});
