/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.email',
  name: 'EmailVerificationWebAgent',
  implements: [ 'foam.nanos.http.WebAgent' ],

  documentation: 'Service to process user email verification and redirect user to URL provided',

  javaImports: [
    'foam.dao.DAO',
    'foam.i18n.TranslationService',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.DAOResourceLoader',
    'foam.nanos.notification.email.EmailTemplate',
    'java.io.PrintWriter',
    'java.util.Collections',
    'javax.servlet.http.HttpServletRequest',
    'javax.servlet.http.HttpServletResponse',
    'org.apache.commons.lang3.StringUtils',
    'org.jtwig.environment.EnvironmentConfigurationBuilder',
    'org.jtwig.JtwigModel',
    'org.jtwig.JtwigTemplate',
    'org.jtwig.resource.loader.TypedResourceLoader'
  ],

  messages: [
    { name: 'EMAIL_VERIFIED_SUCCESS', message: 'Your email has now been verified.' },
    { name: 'EMAIL_VERIFIED_ERROR', message: 'There was a problem verifying your email.' },
    { name: 'USER_NOT_FOUND', message: 'User not found.' },
    { name: 'TOKEN_NOT_FOUND', message: 'Token not found.' },
    { name: 'EMAIL_ALREADY_VERIFIED', message: 'Email already verified.' }
  ],

  properties: [
    {
      name: 'config',
      class: 'Object',
      javaType: 'org.jtwig.environment.EnvironmentConfiguration'
    }
  ],

  methods: [
    {
      name: 'execute',
      args: [
        { name: 'x', javaType: 'foam.core.X' }
      ],
      javaCode: `
        DAO                userDAO          = (DAO) x.get("localUserDAO");
        EmailTokenService  emailToken       = (EmailTokenService) x.get("emailToken");
    
        HttpServletRequest request          = x.get(HttpServletRequest.class);
        HttpServletResponse response        = x.get(HttpServletResponse.class);
    
        String             token            = request.getParameter("token");
        String             userId           = request.getParameter("userId");
        String             redirect         = request.getParameter("redirect");
        User               user             = (User) userDAO.find(Long.valueOf(userId));

        TranslationService ts = (TranslationService) x.get("translationService");
        String local = user.getLanguage().getCode().toString();
        String translatedMsg = "";

        String             message          = ts.getTranslation(local, getClassInfo().getId()+ ".EMAIL_VERIFIED_SUCCESS", this.EMAIL_VERIFIED_SUCCESS);
        PrintWriter        out              = x.get(PrintWriter.class);

        try {
          if ( token == null || "".equals(token) ) {
            translatedMsg = ts.getTranslation(local, getClassInfo().getId()+ ".TOKEN_NOT_FOUND", this.TOKEN_NOT_FOUND);
            throw new Exception(translatedMsg);
          }
    
          if ( "".equals(userId) || ! StringUtils.isNumeric(userId) ) {
            translatedMsg = ts.getTranslation(local, getClassInfo().getId()+ ".USER_NOT_FOUND", this.USER_NOT_FOUND);
            throw new Exception(translatedMsg);
          }
    
          if ( user.getEmailVerified() ) {
            translatedMsg = ts.getTranslation(local, getClassInfo().getId()+ ".EMAIL_ALREADY_VERIFIED", this.EMAIL_ALREADY_VERIFIED);
            throw new Exception(translatedMsg);
          }
          user = (User) user.fclone();
          emailToken.processToken(x, user, token);
        } catch (Throwable t) {
          String msg = t.getMessage();
          ((Logger) x.get("logger")).error(msg);
          t.printStackTrace();
          translatedMsg = ts.getTranslation(local, getClassInfo().getId()+ ".EMAIL_VERIFIED_ERROR", this.EMAIL_VERIFIED_ERROR);
          message = translatedMsg + "<br>" + msg;
        } finally {
          if ( getConfig() == null ) {
            setConfig(EnvironmentConfigurationBuilder
                .configuration()
                .resources()
                .resourceLoaders()
                .add(new TypedResourceLoader("dao", new DAOResourceLoader(x, (String) user.getGroup())))
                .and().and()
                .build());
          }
    
          EmailTemplate emailTemplate = DAOResourceLoader.findTemplate(x, "verify-email-link", (String) user.getGroup());
          JtwigTemplate template = JtwigTemplate.inlineTemplate(emailTemplate.getBody(), getConfig());
          JtwigModel model = JtwigModel.newModel(Collections.<String, Object>singletonMap("msg", message));
          out.write(template.render(model));
          if ( ! redirect.equals("null") ){
            try {
              response.addHeader("REFRESH","2;URL="+redirect);
            } catch (Exception e) {
              e.printStackTrace();
            }
          }
        }
      `
    }
  ]
});
