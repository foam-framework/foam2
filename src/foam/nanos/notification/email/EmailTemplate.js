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
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.app.EmailConfig',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Group',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.SafetyUtil',
    'java.lang.NoSuchFieldException',
    'java.nio.charset.StandardCharsets',
    'java.util.List',
    'org.jtwig.environment.EnvironmentConfiguration',
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
      view: { class: 'foam.u2.tag.TextArea', rows: 40, cols: 150 },
      javaSetter:
        `body_ = val;
        bodyIsSet_ = true;`
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
      documentation: 'Throws exception if any errors - calling Service will/should catch.',
      type: 'foam.nanos.notification.email.EmailMessage',
      javaThrows: ['java.lang.NoSuchFieldException'],
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User',
          documentation: 'user whose the recipient of the email being sent'
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
        },
        {
          name: 'config',
          javaType: 'org.jtwig.environment.EnvironmentConfiguration'
        }
      ],
      javaCode: `
        if ( emailMessage == null ) throw new NoSuchFieldException("emailMessage is Null");

        String tempKeyString = "";
        Object value = null;
        JtwigModel model = null;

        // checking for scenerio where Template is just populating defaults for an emailMessage
        if ( getId() != 0 ){
          for ( Object key : templateArgs.keySet() ) {
            value = templateArgs.get((String)key);
            if ( value instanceof String ) {
              tempKeyString = (String) value;
              templateArgs.put((String) key, new String(tempKeyString.getBytes(StandardCharsets.ISO_8859_1), StandardCharsets.UTF_8));
            }
          }

          model = JtwigModel.newModel(templateArgs);
          if ( model == null ) throw new NoSuchFieldException("JtwigModel is Null");
        }

        // Try to locate user group, from template
        Group group = user != null ? user.findGroup(x) : null;

        // should have all properties necessary set by here, therefore process this template onto an emailMessage
        return fillInEmailProperties_(x, emailMessage, model, group, config);
      `
    },
    {
      name: 'fillInEmailProperties_',
      type: 'foam.nanos.notification.email.EmailMessage',
      documentation: `
        Order of precedence:
        1) Properties set on the EmailMessage,
        2) Properties set on the EmailTemplate(this),
        3) Properties set on the Group,
        4) Properties set as default on emailConfig: 
            which exists for 'From', 'ReplyTo' and 'DisplayName' email properties.
        `,
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
          name: 'model',
          javaType: 'org.jtwig.JtwigModel'
        },
        {
          name: 'group',
          javaType: 'foam.nanos.auth.Group'
        },
        {
          name: 'config',
          javaType: 'EnvironmentConfiguration'
        }
      ],
      javaCode: `
        EmailConfig emailConfig = (EmailConfig) x.get("emailConfig");

        // BODY:
        if ( SafetyUtil.isEmpty(emailMessage.getBody()) ) {
          JtwigTemplate templateBody = JtwigTemplate.inlineTemplate(getBody(), config);
          emailMessage.setBody(templateBody.render(model));
        }
        
        // REPLY TO:
        if ( SafetyUtil.isEmpty(emailMessage.getReplyTo()) ) {
          if ( ! foam.util.SafetyUtil.isEmpty(getReplyTo()) ) {
            JtwigTemplate templateDisplayName = JtwigTemplate.inlineTemplate(getReplyTo(), config);
            emailMessage.setReplyTo(templateDisplayName.render(model));
          } else {
            if ( group != null && ! SafetyUtil.isEmpty(group.getReplyTo()) ) {
              emailMessage.setReplyTo(group.getReplyTo());
            } else {
              emailMessage.setReplyTo(emailConfig.getReplyTo());
            }
          }
        }

        // DISPLAY NAME:
        if ( SafetyUtil.isEmpty(emailMessage.getDisplayName()) ) {
          if ( ! foam.util.SafetyUtil.isEmpty(getDisplayName()) ) {
            JtwigTemplate templateDisplayName = JtwigTemplate.inlineTemplate(getDisplayName(), config);
            emailMessage.setDisplayName(templateDisplayName.render(model));
          } else {
            if ( group != null && ! SafetyUtil.isEmpty(group.getDisplayName())) {
              emailMessage.setDisplayName(group.getDisplayName());
            } else {
              emailMessage.setDisplayName(emailConfig.getDisplayName());
            }
          }
        }

        // SUBJECT:
        //  Since subject is very specific to each email there is no group field or default value for this property.
        if ( foam.util.SafetyUtil.isEmpty(emailMessage.getSubject()) &&
          ! foam.util.SafetyUtil.isEmpty(getSubject())
        ) {
          JtwigTemplate templateSubject = JtwigTemplate.inlineTemplate(getSubject(), config);
          emailMessage.setSubject(templateSubject.render(model));
        }

        // SEND TO:
        //  Since sendTo is very specific to each email there is no group field or default value for this property.
        if ( emailMessage.getTo().length == 0 && ! foam.util.SafetyUtil.isEmpty(getSendTo()) ) {
          JtwigTemplate templateSendTo = JtwigTemplate.inlineTemplate(getSendTo(), config);
          emailMessage.setTo(new String[] {templateSendTo.render(model)});
        }

        // FROM:
        if ( SafetyUtil.isEmpty(emailMessage.getFrom()) ) {
          emailMessage.setFrom(emailConfig.getFrom());
        }

        return emailMessage;
      `
    }
  ]
});
