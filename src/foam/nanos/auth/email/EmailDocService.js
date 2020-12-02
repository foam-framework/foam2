/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.email',
  name: 'EmailDocService',
  documentation: 'Sends an email with an html doc',

  implements: [
    'foam.nanos.auth.email.EmailDocInterface'
  ],


  imports: [
    'appConfig',
    'email',
    'localUserDAO',
    'tokenDAO',
    'DAO htmlDocDAO',
    'Logger logger'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.mlang.MLang',
    'foam.nanos.auth.HtmlDoc',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.Emails.EmailsUtility',
    'java.util.HashMap'
  ],

  methods: [
    {
      name: 'emailDoc',
      javaCode:
      `
      try{
        DAO htmlDocDAO = (DAO) getHtmlDocDAO();
        htmlDocDAO = htmlDocDAO.where(MLang.EQ(HtmlDoc.NAME, docName));
        ArraySink listSink = (ArraySink) htmlDocDAO.orderBy(new foam.mlang.order.Desc(HtmlDoc.ID)).limit(1).select(new ArraySink());
        HtmlDoc doc = (HtmlDoc) listSink.getArray().get(0);
        
        EmailMessage message = new EmailMessage();
        message.setTo(new String[] { user.getEmail() });
      
        HashMap<String, Object> args = new HashMap<>();
        args.put("doc", doc.getBody());
      
        EmailsUtility.sendEmailFromTemplate(getX(), user, message, "docEmail", args);
        return true;
      }catch(Throwable t){
        ((Logger) getLogger()).error("Error retrieving Terms and Conditions.", t);
      }
      return false;
         
       `
    },]
});
