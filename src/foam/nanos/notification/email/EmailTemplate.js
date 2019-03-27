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
    'foam.nanos.auth.User',
    'foam.nanos.auth.Group',
    'foam.nanos.notification.email.DAOResourceLoader',
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
      documentation: `Displayed as the name in the email from field.`
    },
    {
      class: 'String',
      name: 'sendTo',
      documentation: `This property will set to whomever the email is being sent
        to.`
    },
    {
      class: 'String',
      name: 'replyTo',
      documentation: `Displayed as the from email field.`
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
      documentation: `Throws exception if any errors - calling Service will/should catch.`,
      type: 'EmailMessage',
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
          javaType: 'java.util.Map<String, Object>',
          documentation: 'Template arguments'
        },
        {
          name: 'config',
          javaType: 'EnvironmentConfiguration'
        }
      ],
      javaCode: `
        // Check basic properties
        if ( user == null ) throw new NoSuchFieldException("user is Null");
        if ( emailMessage == null ) throw new NoSuchFieldException("emailMessage is Null");

        String tempKeyString = "";
        Object value = null;

        // process templateArgs
        for ( String key : templateArgs.keySet() ) {
          value = templateArgs.get(key);
          if ( value instanceof String ) {
            tempKeyString = (String) value;
            templateArgs.put(key, new String(tempKeyString.getBytes(StandardCharsets.ISO_8859_1), StandardCharsets.UTF_8));
          }
        }

        // build model, and confirm it was built
        JtwigModel model = JtwigModel.newModel(templateArgs);
        if ( model == null ) throw new NoSuchFieldException("JtwigModel is Null");

        // confirm user group
        DAO groupDAO   = ((DAO) x.get("groupDAO")).inX(x);
        Group group    = (Group) groupDAO.find(user.getGroup());
        if ( group == null ) {
          if ( SafetyUtil.isEmpty(getGroup())) {
            throw new NoSuchFieldException("Group is Null");
          }
          group    = (Group) groupDAO.find(getGroup());
          if ( group == null ) {
            throw new NoSuchFieldException("Group is Null");
          }
        }

        // should have all properties necessary set by here, therefore process this template onto an emailMessage
        return fillInEmailProperties(x, emailMessage, model, group, config);
      `
    },
    {
      name: 'fillInEmailProperties',
      type: 'EmailMessage',
      visibility: 'private',
      documentation: `
        Order of precedence:
        1) Properties set on the EmailMessage,
        2) Properties set on the EmailTemplate(this),
        3) Properties set on the Group,
        4) Properties set as default: 
            which exists for 'From', 'ReplyTo' and 'DisplayName' email properties.
            passed onto emailMessage obj from service.email
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
        // BODY:
        JtwigTemplate templateBody = JtwigTemplate.inlineTemplate(getBody(), config);
        emailMessage.setBody(templateBody.render(model));

        // FROM:
        // The from property is the one property not on emailTemplate(this)
        // if not already on the emailMessage default values will/should be set after this.apply returns

        // REPLY TO:
        if ( SafetyUtil.isEmpty(emailMessage.getReplyTo()) ) {
          if ( ! foam.util.SafetyUtil.isEmpty(getReplyTo()) ) {
            JtwigTemplate templateDisplayName = JtwigTemplate.inlineTemplate(getReplyTo(), config);
            emailMessage.setReplyTo(templateDisplayName.render(model));
          } else {
            if ( ! SafetyUtil.isEmpty(group.getReplyTo()) ) {
              emailMessage.setReplyTo(group.getReplyTo());
            }
          }
        }

        // DISPLAY NAME:
        if ( SafetyUtil.isEmpty(emailMessage.getDisplayName()) ) {
          if ( ! foam.util.SafetyUtil.isEmpty(getDisplayName()) ) {
            JtwigTemplate templateDisplayName = JtwigTemplate.inlineTemplate(getDisplayName(), config);
            emailMessage.setDisplayName(templateDisplayName.render(model));
          } else {
            if (! SafetyUtil.isEmpty(group.getDisplayName())) {
              emailMessage.setDisplayName(group.getDisplayName());
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
        if ( emailMessage.getTo().length == 0 &&
          ! foam.util.SafetyUtil.isEmpty(getSendTo())
        ) {
          JtwigTemplate templateSendTo = JtwigTemplate.inlineTemplate(getSendTo(), config);
          emailMessage.setTo(new String[] {templateSendTo.render(model)});
        }

        return emailMessage;
      `
    }
  ]
});
