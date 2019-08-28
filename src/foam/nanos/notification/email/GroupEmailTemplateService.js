/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'GroupEmailTemplateService',

  documentation: 'Fills unset properties on an email with values from the group.',

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
      documentation:
      `Looks for group email properties on passed in group and then up the chain to root group.
       Keeping the first set properties while looping through the parents.
       Note: It is possible that only one of the properties is set on the group. Thus keeping that
       property and continuing to look up to parent to find remaining empty property.
       `,
      javaCode: `
        DAO groupDAO = (DAO) x.get("groupDAO");
        Group grp = (Group)groupDAO.find(group);
        if ( grp == null ) return emailMessage;

        String  dspName      = "";
        String  rpyTo        = "";
        String  from         = "";
        boolean dspNameIsSet = false;
        boolean rpyToIsSet   = false;
        boolean fromIsSet    = false;
        do {
          rpyTo   = rpyToIsSet   ? rpyTo   : grp.getReplyTo();
          dspName = dspNameIsSet ? dspName : grp.getDisplayName();
          from    = fromIsSet    ? from    : grp.getFrom();
          
          rpyToIsSet   = rpyToIsSet   ? rpyToIsSet   : ! SafetyUtil.isEmpty(rpyTo);
          dspNameIsSet = dspNameIsSet ? dspNameIsSet : ! SafetyUtil.isEmpty(dspName);
          fromIsSet    = fromIsSet    ? fromIsSet    : ! SafetyUtil.isEmpty(from);

          if (rpyToIsSet && dspNameIsSet && fromIsSet) break;

          group = grp.getParent();
          grp = (Group) groupDAO.find(group);
        } while ( grp != null );

        // REPLY TO:
        if ( SafetyUtil.isEmpty(emailMessage.getReplyTo()) && rpyToIsSet ) {
          emailMessage.setReplyTo(rpyTo);
        }
    
        // DISPLAY NAME:
        if ( SafetyUtil.isEmpty(emailMessage.getDisplayName()) && dspNameIsSet ) {
          emailMessage.setDisplayName(dspName);
        }

        // FROM:
        if ( SafetyUtil.isEmpty(emailMessage.getFrom()) && fromIsSet ) {
          emailMessage.setFrom(from);
        }
    
        return emailMessage;

      `
    }
  ]
});
