/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth.email;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.DAOResourceLoader;
import foam.nanos.notification.email.EmailTemplate;
import org.apache.commons.lang3.StringUtils;
import org.jtwig.JtwigModel;
import org.jtwig.JtwigTemplate;
import org.jtwig.environment.EnvironmentConfiguration;
import org.jtwig.environment.EnvironmentConfigurationBuilder;
import org.jtwig.resource.loader.TypedResourceLoader;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Collections;

public class EmailVerificationWebAgent
    implements WebAgent
{
  protected EnvironmentConfiguration config_;

  @Override
  public void execute(X x) {
    String             message          = "Your email has now been verified.";
    PrintWriter        out              = x.get(PrintWriter.class);

    DAO                userDAO          = (DAO) x.get("localUserDAO");
    EmailTokenService  emailToken       = (EmailTokenService) x.get("emailToken");

    HttpServletRequest request          = x.get(HttpServletRequest.class);
    HttpServletResponse response        = x.get(HttpServletResponse.class);

    String             token            = request.getParameter("token");
    String             userId           = request.getParameter("userId");
    String             redirect         = request.getParameter("redirect");
    User               user             = (User) userDAO.find(Long.valueOf(userId));

    try {
      if ( token == null || "".equals(token) ) {
        throw new Exception("Token not found");
      }

      if ( "".equals(userId) || !StringUtils.isNumeric(userId) ) {
        throw new Exception("User not found.");
      }

      if ( user.getEmailVerified() ) {
        throw new Exception("Email already verified.");
      }
      user = (User) user.fclone();
      emailToken.processToken(x, user, token);
    } catch (Throwable t) {
      String msg = t.getMessage();
      ((Logger) x.get("logger")).error(msg);
      t.printStackTrace();
      message = "Problem verifying your email.<br>" + msg;
    } finally {
      if ( config_ == null ) {
        config_ = EnvironmentConfigurationBuilder
            .configuration()
            .resources()
            .resourceLoaders()
            .add(new TypedResourceLoader("dao", new DAOResourceLoader(x, (String) user.getGroup())))
            .and().and()
            .build();
      }

      EmailTemplate emailTemplate = DAOResourceLoader.findTemplate(x, "verify-email-link", (String) user.getGroup());
      JtwigTemplate template = JtwigTemplate.inlineTemplate(emailTemplate.getBody(), config_);
      JtwigModel model = JtwigModel.newModel(Collections.<String, Object>singletonMap("msg", message));
      out.write(template.render(model));
      if (!redirect.equals("null")){
        try {
          response.addHeader("REFRESH","2;URL="+redirect);
        } catch (Exception e) {
          e.printStackTrace();
        }
      }
    }
  }
}
