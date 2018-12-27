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
    'localEmailMessageDAO',
    'localUserDAO',
    'tokenDAO'
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.token.Token',
    'foam.nanos.auth.User',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.Auth',
    'foam.util.Email',
    'foam.util.Password',
    'foam.util.SafetyUtil',
    'java.util.Calendar',
    'java.util.HashMap',
    'java.util.List',
    'java.util.UUID'
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
      name: 'generateTokenWithParameters',
      javaCode:
`AppConfig appConfig = (AppConfig) x.get("appConfig");
DAO userDAO = (DAO) getLocalUserDAO();
DAO tokenDAO = (DAO) getTokenDAO();
String url = appConfig.getUrl()
    .replaceAll("/$", "");

// check if email invalid
if ( user == null || ! Email.isValid(user.getEmail()) ) {
  throw new RuntimeException("Invalid Email");
}

Sink sink = new ArraySink();
sink = userDAO.where(MLang.EQ(User.EMAIL, user.getEmail()))
   .limit(1).select(sink);

List list = ((ArraySink) sink).getArray();
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

DAO localEmailMessageDAO = (DAO) getLocalEmailMessageDAO();
EmailMessage message = new EmailMessage();
message.setTo(new String[] { user.getEmail() });

HashMap<String, Object> args = new HashMap<>();
args.put("name", String.format("%s %s", user.getFirstName(), user.getLastName()));
args.put("link", url +"?token=" + token.getData() + "#reset");

message.setTemplate("reset-password");
message.setTemplateArgs(args);
localEmailMessageDAO.inX(Auth.sudo(x, user)).put(message);
return true;`
    },
    {
      name: 'processToken',
      javaCode:
`if ( user == null || SafetyUtil.isEmpty(user.getDesiredPassword()) ) {
  throw new RuntimeException("Cannot leave new password field empty");
}

String newPassword = user.getDesiredPassword();

DAO userDAO = (DAO) getLocalUserDAO();
DAO tokenDAO = (DAO) getTokenDAO();
Calendar calendar = Calendar.getInstance();

Sink sink = new ArraySink();
sink = tokenDAO.where(MLang.AND(
  MLang.EQ(Token.PROCESSED, false),
  MLang.GT(Token.EXPIRY, calendar.getTime()),
  MLang.EQ(Token.DATA, token)
)).limit(1).select(sink);

List data = ((ArraySink) sink).getArray();
if ( data == null || data.size() == 0 ) {
  throw new RuntimeException("Token not found");
}

// find user from token
Token tokenResult = (Token) data.get(0);
User userResult = (User) userDAO.find(tokenResult.getUserId());
if ( userResult == null ) {
  throw new RuntimeException("User not found");
}

if ( ! Password.isValid(newPassword) ) {
  throw new RuntimeException("Invalid password");
}

// update user's password
userResult = (User) userResult.fclone();
userResult.setPasswordLastModified(Calendar.getInstance().getTime());
userResult.setPreviousPassword(userResult.getPassword());
userResult.setPassword(Password.hash(newPassword));
userResult.setPasswordExpiry(null);
userDAO.put(userResult);

// set token processed to true
tokenResult = (Token) tokenResult.fclone();
tokenResult.setProcessed(true);
tokenDAO.put(tokenResult);

DAO localEmailMessageDAO = (DAO) getLocalEmailMessageDAO();
EmailMessage message = new EmailMessage();
message.setTo(new String[] { userResult.getEmail() });
HashMap<String, Object> args = new HashMap<>();
args.put("name", userResult.getFirstName());
message.setTemplate("password-changed");
message.setTemplateArgs(args);
localEmailMessageDAO.inX(Auth.sudo(x, userResult)).put(message);
return true;`
    }
  ]
});
