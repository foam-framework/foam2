/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailTemplate',

  documentation: `Represents an email template that stores the default properties of a specific email,
  mimics the EmailMessage which is the end obj that is processed into email.`,

  javaImports: [
    'foam.core.X',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.SafetyUtil',
    'java.nio.charset.StandardCharsets',
    'org.jtwig.environment.EnvironmentConfiguration',
    'org.jtwig.environment.EnvironmentConfigurationBuilder',
    'org.jtwig.JtwigModel',
    'org.jtwig.JtwigTemplate',
    'org.jtwig.resource.loader.TypedResourceLoader'
  ],

  tableColumns: ['name', 'group'],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      documentation: 'Template name'
    },
    {
      class: 'String',
      name: 'group',
      value: '*'
    },
    {
      class: 'String',
      name: 'subject',
      documentation: 'Template subject'
    },
    {
      class: 'String',
      name: 'body',
      documentation: 'Template body',
      view: { class: 'foam.u2.tag.TextArea', rows: 40, cols: 150 }
    },
    {
      class: 'String',
      name: 'displayName',
      documentation: 'Displayed as the name in the email from field.'
    },
    {
      class: 'String',
      name: 'sendTo',
      documentation: 'This property will set to whomever the email is being sent to.'
    },
    {
      class: 'String',
      name: 'replyTo',
      documentation: 'Displayed as the from email field.'
    },
    {
      class: 'Array',
      name: 'bodyAsByteArray',
      hidden: true,
      transient: true,
      type: 'Byte[]',
      javaFactory: 'return getBody() != null ? getBody().getBytes(StandardCharsets.UTF_8) : null;'
    }
  ],
  methods: [
    {
      name: 'apply',
      type: 'foam.nanos.notification.email.EmailMessage',
      documentation: 'Applies template properties to emailMessage, where emailMessage property is empty',
      javaThrows: ['java.lang.NoSuchFieldException'],
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'group',
          class: 'String',
          documentation: 'group of user whose the recipient of the email being sent'
        },
        {
          name: 'emailMessage',
          type: 'foam.nanos.notification.email.EmailMessage',
          documentation: 'Email message'
        },
        {
          name: 'templateArgs',
          type: 'Map',
          documentation: 'Template arguments'
        }
      ],
      javaCode: `
        Logger logger = (Logger) x.get("logger");

        if ( emailMessage == null ) {
          throw new NoSuchFieldException("emailMessage is Null");
        }

        String tempKeyString = "";
        Object value = null;
        JtwigModel model = null;

        EnvironmentConfiguration config = EnvironmentConfigurationBuilder
          .configuration()
            .resources()
              .resourceLoaders()
                .add(new TypedResourceLoader("dao", new DAOResourceLoader(x, group)))
                .and()
            .and()
          .build();

        // Creating model from template
        for ( Object key : templateArgs.keySet() ) {
          value = templateArgs.get((String)key);
          model = JtwigModel.newModel(templateArgs);
          if ( model == null ) {
            throw new NoSuchFieldException("JtwigModel is Null");
          }
        }

        // BODY:
        if ( ! emailMessage.isPropertySet("body") ) {
          emailMessage.setBody((JtwigTemplate.inlineTemplate(getBody(), config)).render(model));
        }

        // REPLY TO:
        if ( ! emailMessage.isPropertySet("replyTo") && ! SafetyUtil.isEmpty(getReplyTo()) ) {
            emailMessage.setReplyTo((JtwigTemplate.inlineTemplate(getReplyTo(), config)).render(model));
        }

        // DISPLAY NAME:
        if ( ! emailMessage.isPropertySet("displayName") && ! SafetyUtil.isEmpty(getDisplayName()) ) {
          emailMessage.setDisplayName((JtwigTemplate.inlineTemplate(getDisplayName(), config)).render(model));
        }

        // SUBJECT:
        if ( ! emailMessage.isPropertySet("subject") && ! SafetyUtil.isEmpty(getSubject()) ) {
          emailMessage.setSubject((JtwigTemplate.inlineTemplate(getSubject(), config)).render(model));
        }

        // SEND TO:
        if ( ! emailMessage.isPropertySet("to") && ! SafetyUtil.isEmpty(getSendTo()) ) {
          emailMessage.setTo(new String[] { (JtwigTemplate.inlineTemplate(getSendTo(), config)).render(model) });
        }

        return emailMessage;
      `
    }
  ]
});
