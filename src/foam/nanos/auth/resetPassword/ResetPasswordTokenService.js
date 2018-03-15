/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.resetPassword',
  name: 'ResetPasswordTokenService',
  extends: 'foam.nanos.auth.token.AbstractTokenService',

  documentation: 'Implementation of Token Service used for reset password',

  imports: [
    'appConfig',    
    'email',
    'localUserDAO',    
    'tokenDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ListSink',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.token.Token',    
    'foam.nanos.auth.User',    
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.email.EmailService',
    'foam.util.Password',
    'foam.util.SafetyUtil',
    'java.util.Calendar',
    'java.util.HashMap',
    'java.util.List',
    'java.util.UUID',
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(foam.java.Code.create({
          data: 'java.util.regex.Pattern p = java.util.regex.Pattern.compile("[^a-zA-Z0-9]");'
        }))
      }
    }
  ],

  methods: [
    {
      name: 'generateToken',
      javaCode:
`
try{
AppConfig appConfig = (AppConfig) getAppConfig();
DAO userDAO = (DAO) getLocalUserDAO();
DAO tokenDAO = (DAO) getTokenDAO();
String url = appConfig.getUrl()
    .replaceAll("/$", "");

Sink sink = new ListSink();
sink = userDAO.where(MLang.EQ(User.EMAIL, user.getEmail()))/**/
   .limit(1).select(sink);

List list = ((ListSink) sink).getData();
if ( list == null || list.size() == 0 ) {
  throw new RuntimeException("User not found");
}

user = (User) list.get(0);
if ( user == null ) {
  throw new RuntimeException("User not found");
}

Token token = new Token();
token.setUserId(user.getId());
token.setExpiry(generateExpiryDate());
token.setData(UUID.randomUUID().toString());
token = (Token) tokenDAO.put(token);

EmailService email = (EmailService) getEmail();
EmailMessage message = new EmailMessage();
message.setTo(new String[] { user.getEmail() });

HashMap<String, Object> args = new HashMap<>();
args.put("name", String.format("%s %s", user.getFirstName(), user.getLastName()));
args.put("link", url +"?token=" + token.getData() + "#reset");

email.sendEmailFromTemplate(user, message, "reset-password", args);
return true;
}catch(Exception e){
  e.printStackTrace();
}
return false;`
    },
    {
      name: 'processToken',
      javaCode:
`if ( user == null || SafetyUtil.isEmpty(user.getPassword()) ) {
  throw new RuntimeException("Cannot leave new password field empty");
}

String newPassword = user.getPassword();
if ( newPassword.contains(" ")) {
  throw new RuntimeException("Password cannot contains spaces");
}

int length = newPassword.length();
if ( length < 7 || length > 32 ) {
  throw new RuntimeException("Password must be 7-32 characters long");
}

if ( newPassword.equals(newPassword.toLowerCase()) ) {
  throw new RuntimeException("Password must have one capital letter");
}

if ( ! newPassword.matches(".*\\\\d+.*") ) {
  throw new RuntimeException("Password must have one numeric character");
}

if ( p.matcher(newPassword).matches() ) {
  throw new RuntimeException("Password must not contain: !@#$%^&*()_+");
}

DAO userDAO = (DAO) getLocalUserDAO();
DAO tokenDAO = (DAO) getTokenDAO();
Calendar calendar = Calendar.getInstance();

Sink sink = new ListSink();
sink = tokenDAO.where(MLang.AND(
  MLang.EQ(Token.PROCESSED, false),
  MLang.GT(Token.EXPIRY, calendar.getTime()),
  MLang.EQ(Token.DATA, token)
)).limit(1).select(sink);

List data = ((ListSink) sink).getData();
if ( data == null || data.size() == 0 ) {
  throw new RuntimeException("Token not found");
}

// set token processed to true
Token tokenResult = (Token) data.get(0);
tokenResult.setProcessed(true);
tokenDAO.put(tokenResult);

User userResult = (User) userDAO.find(tokenResult.getUserId());
if ( userResult == null ) {
  throw new RuntimeException("User not found");
}

if ( ! Password.isValid(newPassword) ) {
  throw new RuntimeException("Invalid password");
}

// update user's password
userResult.setPasswordLastModified(Calendar.getInstance().getTime());
userResult.setPreviousPassword(userResult.getPassword());
userResult.setPassword(Password.hash(newPassword));
userDAO.put(userResult);
return true;`
    }
  ]
});
