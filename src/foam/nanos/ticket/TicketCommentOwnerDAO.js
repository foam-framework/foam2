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
    'foam.nanos.auth.User'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
    TicketComment comment = (TicketComment) obj;
    if ( comment.getOwner() == 0 ) {
      User user = (User) x.get("user");
      User agent = (User) x.get("agent");
      comment.setOwner(agent != null ? agent.getId() : user.getId());
    }
    comment = (TicketComment) getDelegate().put_(x, comment);
    return comment;
      `
    }
  ]
});
