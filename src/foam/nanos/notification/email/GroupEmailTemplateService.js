/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'GroupEmailTemplateService',

  implements: [
    'foam.nanos.notification.email.EmailPropertyService'
  ],

  methods: [
    {
      name: 'apply',
      type: 'foam.nanos.notification.email.EmailMessage',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'group',
          type: 'foam.nanos.auth.Group',
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
        },
        {
          name: 'config',
          javaType: 'org.jtwig.environment.EnvironmentConfiguration'
        }
      ],
      javaCode: `
        // all args null except x, user, emailMessage

        if ( group == null ) return emailMessage;

        // REPLY TO:
        if ( SafetyUtil.isEmpty(emailMessage.getReplyTo()) &&
          ! SafetyUtil.isEmpty(group.getReplyTo()))
          {
          emailMessage.setReplyTo(group.getReplyTo());
        }
    
        // DISPLAY NAME:
        if ( SafetyUtil.isEmpty(emailMessage.getDisplayName()) &&
          ! SafetyUtil.isEmpty(group.getDisplayName()))
          {
          emailMessage.setDisplayName(group.getDisplayName());
        }
    
        return emailMessage;

      `
    }
  ]
});








// {
//   name: 'fillInEmailProperties_',
//   type: 'foam.nanos.notification.email.EmailMessage',
//   documentation: `
//     Order of precedence:
//     1) Properties set on the EmailMessage,
//     2) Properties set on the EmailTemplate(this),
//     3) Properties set on the Group,
//     4) Properties set as default on emailConfig: 
//         which exists for 'From', 'ReplyTo' and 'DisplayName' email properties.
//     `,
//   args: [
//     {
//       name: 'x',
//       type: 'Context'
//     },
//     {
//       name: 'emailMessage',
//       javaType: 'final foam.nanos.notification.email.EmailMessage'
//     },
//     {
//       name: 'model',
//       javaType: 'org.jtwig.JtwigModel'
//     },
//     {
//       name: 'group',
//       javaType: 'foam.nanos.auth.Group'
//     },
//     {
//       name: 'config',
//       javaType: 'EnvironmentConfiguration'
//     }
//   ],
//   javaCode: `
//     EmailConfig emailConfig = (EmailConfig) x.get("emailConfig");

//     // BODY:
//     if ( SafetyUtil.isEmpty(emailMessage.getBody()) ) {
//       JtwigTemplate templateBody = JtwigTemplate.inlineTemplate(getBody(), config);
//       emailMessage.setBody(templateBody.render(model));
//     }
    
//     // REPLY TO:
//     if ( SafetyUtil.isEmpty(emailMessage.getReplyTo()) ) {
//       if ( ! foam.util.SafetyUtil.isEmpty(getReplyTo()) ) {
//         JtwigTemplate templateDisplayName = JtwigTemplate.inlineTemplate(getReplyTo(), config);
//         emailMessage.setReplyTo(templateDisplayName.render(model));
//       } else {
//         if ( group != null && ! SafetyUtil.isEmpty(group.getReplyTo()) ) {
//           emailMessage.setReplyTo(group.getReplyTo());
//         } else {
//           emailMessage.setReplyTo(emailConfig.getReplyTo());
//         }
//       }
//     }

//     // DISPLAY NAME:
//     if ( SafetyUtil.isEmpty(emailMessage.getDisplayName()) ) {
//       if ( ! foam.util.SafetyUtil.isEmpty(getDisplayName()) ) {
//         JtwigTemplate templateDisplayName = JtwigTemplate.inlineTemplate(getDisplayName(), config);
//         emailMessage.setDisplayName(templateDisplayName.render(model));
//       } else {
//         if ( group != null && ! SafetyUtil.isEmpty(group.getDisplayName())) {
//           emailMessage.setDisplayName(group.getDisplayName());
//         } else {
//           emailMessage.setDisplayName(emailConfig.getDisplayName());
//         }
//       }
//     }

//     // SUBJECT:
//     //  Since subject is very specific to each email there is no group field or default value for this property.
//     if ( foam.util.SafetyUtil.isEmpty(emailMessage.getSubject()) &&
//       ! foam.util.SafetyUtil.isEmpty(getSubject())
//     ) {
//       JtwigTemplate templateSubject = JtwigTemplate.inlineTemplate(getSubject(), config);
//       emailMessage.setSubject(templateSubject.render(model));
//     }

//     // SEND TO:
//     //  Since sendTo is very specific to each email there is no group field or default value for this property.
//     if ( emailMessage.getTo().length == 0 && ! foam.util.SafetyUtil.isEmpty(getSendTo()) ) {
//       JtwigTemplate templateSendTo = JtwigTemplate.inlineTemplate(getSendTo(), config);
//       emailMessage.setTo(new String[] {templateSendTo.render(model)});
//     }

//     // FROM:
//     if ( SafetyUtil.isEmpty(emailMessage.getFrom()) ) {
//       emailMessage.setFrom(emailConfig.getFrom());
//     }

//     return emailMessage;
//   `
// }