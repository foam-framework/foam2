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
        }
      ],
      javaCode: `
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
