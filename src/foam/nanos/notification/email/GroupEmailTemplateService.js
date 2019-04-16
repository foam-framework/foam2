/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'GroupEmailTemplateService',

  documentation: 'Used in conjuction with ChainedPropertyService',

  implements: [
    'foam.nanos.notification.email.EmailPropertyService'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.Group',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
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
      documentation:
      `Looks for group email properties on passed in group and then up the chain to root group.
       Note: It is possible that only one of the properties is set on the group.`,
      javaCode: `
        Group grp = null;
        do {
          grp = (Group)((DAO) x.get("groupDAO")).find(group);
          if ( grp == null ) return emailMessage;
          group = grp.getParent();
        } while ( SafetyUtil.isEmpty(grp.getReplyTo()) && SafetyUtil.isEmpty(grp.getDisplayName()) );

        // REPLY TO:
        if ( SafetyUtil.isEmpty(emailMessage.getReplyTo()) &&
          ! SafetyUtil.isEmpty(grp.getReplyTo()))
          {
          emailMessage.setReplyTo(grp.getReplyTo());
        }
    
        // DISPLAY NAME:
        if ( SafetyUtil.isEmpty(emailMessage.getDisplayName()) &&
          ! SafetyUtil.isEmpty(grp.getDisplayName()))
          {
          emailMessage.setDisplayName(grp.getDisplayName());
        }
    
        return emailMessage;

      `
    }
  ]
});
