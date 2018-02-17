foam.CLASS({
  package: 'foam.nanos.auth.email',
  name: 'EmailTokenService',
  extends: 'foam.nanos.auth.token.AbstractTokenService',

  documentation: 'Implementation of Token Service used for verifying email addresses',

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ListSink',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'foam.nanos.app.AppConfig',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.email.EmailService',
    'foam.nanos.auth.token.Token',
    'java.util.Calendar',
    'java.util.HashMap',
    'java.util.List',
    'java.util.UUID'
  ],

  methods: [
    {
      name: 'generateToken',
      javaCode:
`try {
DAO tokenDAO = (DAO) getX().get("tokenDAO");
DAO userDAO = (DAO) getX().get("userDAO");
AppConfig appConfig = (AppConfig) getX().get("appConfig");
Token token = new Token();
token.setUserId(user.getId());
token.setExpiry(generateExpiryDate());
token.setData(UUID.randomUUID().toString());
token = (Token) tokenDAO.put(token);

EmailService email = (EmailService) getX().get("email");
EmailMessage message = new EmailMessage();
message.setTo(new String[]{user.getEmail()});

HashMap<String, Object> args = new HashMap<>();
args.put("name", user.getFirstName());
args.put("email", user.getEmail());
if (!user.getInitialEmailedAmount().equals("$0.00")){
  args.put("amount", user.getInitialEmailedAmount());
}
if (user.getType().equals("Business") || user.getType().equals("Merchant")){
  args.put("link", appConfig.getUrl() + "/service/verifyEmail?userId=" + user.getId() + "&token=" + token.getData() + "&redirect=/");
}
if (user.getType().equals("Personal")){
  if (user.getPortalAdminCreated()) {
    args.put("applink", appConfig.getUrl() + "/service/verifyEmail?userId=" + user.getId() + "&token=" + token.getData() + "&redirect=https://www.apple.com/lae/ios/app-store/");
    args.put("playlink", appConfig.getUrl() + "/service/verifyEmail?userId=" + user.getId() + "&token=" + token.getData() + "&redirect=https://play.google.com/store?hl=en");
  }
  args.put("link", appConfig.getUrl() + "/service/verifyEmail?userId=" + user.getId() + "&token=" + token.getData() + "&redirect=null" );
  user.setPortalAdminCreated(false);
  user.setInitialEmailedAmount("$0.00");
  userDAO.put(user);
}

email.sendEmailFromTemplate(user, message, "welcome-email", args);
return true;
} catch(Throwable t) {
  t.printStackTrace();
  return false;
}`
  },
    {
      name: 'processToken',
      javaCode:
`DAO userDAO = (DAO) getX().get("userDAO");
DAO tokenDAO = (DAO) getX().get("tokenDAO");
Calendar calendar = Calendar.getInstance();

Sink sink = new ListSink();
sink = tokenDAO.where(MLang.AND(
  MLang.EQ(Token.USER_ID, user.getId()),
  MLang.EQ(Token.PROCESSED, false),
  MLang.GT(Token.EXPIRY, calendar.getTime()),
  MLang.EQ(Token.DATA, token)
)).limit(1).select(sink);

List list = ((ListSink) sink).getData();
if ( list == null || list.size() == 0 ) {
  // token not found
  throw new RuntimeException("Token not found");
}

// set token processed to true
Token result = (Token) list.get(0);
result.setProcessed(true);
tokenDAO.put(result);

// set user email verified to true
user.setEmailVerified(true);
userDAO.put(user);
return true;`
    }
  ]
});
