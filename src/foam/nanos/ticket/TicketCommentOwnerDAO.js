/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ticket',
  name: 'TicketCommentOwnerDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Set the ticket's owner`,

  javaImports: [
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
    TicketComment comment = (TicketComment) obj;
    if ( comment.getOwner() == 0 ) {
      Subject subject = (Subject) x.get("subject");
      User realUser = subject.getRealUser();
      comment.setOwner(realUser.getId());
    }
    comment = (TicketComment) getDelegate().put_(x, comment);
    return comment;
      `
    }
  ]
});
