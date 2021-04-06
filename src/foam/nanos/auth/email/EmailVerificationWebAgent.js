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
    'foam.nanos.auth.Subject',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.DAOResourceLoader',
    'foam.nanos.notification.email.EmailTemplate',
    'foam.nanos.notification.email.EmailTemplateEngine',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.Themes',
    'java.io.PrintWriter',
    'java.util.HashMap',
    'javax.servlet.http.HttpServletRequest',
    'javax.servlet.http.HttpServletResponse',
    'org.apache.commons.lang3.StringUtils'
  ],

  messages: [
    { name: 'EMAIL_VERIFIED_SUCCESS', message: 'Your email has now been verified.' },
    { name: 'EMAIL_VERIFIED_ERROR', message: 'There was a problem verifying your email.' },
    { name: 'USER_NOT_FOUND', message: 'User not found.' },
    { name: 'TOKEN_NOT_FOUND', message: 'Token not found.' },
    { name: 'EMAIL_ALREADY_VERIFIED', message: 'Email already verified.' }
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
        Subject subject = (Subject) x.get("subject");
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
          EmailTemplateEngine templateEngine = (EmailTemplateEngine) x.get("templateEngine");
          foam.nanos.theme.Theme theme = getTheme(x, user);
          HashMap args = new HashMap();
          args.put("msg", message);
          if ( theme != null ) {
            args.put("appName", theme.getAppName());
          }
          if ( user != null ) {
            String url = user.findGroup(x).getAppConfig(x).getUrl();
            args.put("logo", url + "/" + theme.getLogo());
          }
          EmailTemplate emailTemplate = DAOResourceLoader.findTemplate(
            x,
            "verify-email-link",
            (String) user.getGroup(),
            user.getLanguage().getCode().toString()
          );
          StringBuilder templateBody = templateEngine.renderTemplate(x, emailTemplate.getBody(), args);
          out.write(templateBody.toString());
          if ( ! redirect.equals("null") ){
            try {
              response.addHeader("REFRESH","2;URL="+redirect);
            } catch (Exception e) {
              e.printStackTrace();
            }
          }
        }
      `
    },
    {
      name: 'getTheme',
      type: 'foam.nanos.theme.Theme',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'user', javaType: 'foam.nanos.auth.User' }
      ],
      javaCode: `
        if ( user != null ) {
          foam.core.X userX = x.put("subject", new Subject.Builder(x).setUser(user).build());
          Theme theme = ((Themes) x.get("themes")).findTheme(userX);
          return theme;
        }
        return null;
      `
    }
  ]
});
