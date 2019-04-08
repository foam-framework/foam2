package foam.util.Email;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import foam.nanos.notification.email.EmailTemplate;
import foam.util.SafetyUtil;
import java.util.Map;
import org.jtwig.environment.EnvironmentConfiguration;
import org.jtwig.environment.EnvironmentConfigurationBuilder;
import org.jtwig.resource.loader.TypedResourceLoader;
import static foam.mlang.MLang.*;

public class EmailsUtility {
  /*
  documentation: 
  Purpose of this function/service is to facilitate the populations of an email and then to actually send the email. 
    STEP 1) find the EmailTemplate,
    STEP 2) apply a template to the emailMessage,
    STEP 3) then to store and send the email we just have to pass the emailMessage through to actual email service.

  Note:
  For email service to work correctly: parameters should be as follows:
  @param x:             Is necessary
  @param user:          Is only necessary to find the right template associated to the group of the user.
                        If null default is * group.
  @param emailMessage:  The obj that gets filled with all the properties that have been passed.
                        eventually becoming the email that is transported out.
  @param templateName:  The template name that is used for this email. It is found and applied based on user.group
  @param templateArgs:  The arguments that are used to fill the template model body.
  */
  public static void sendEmailFromTemplate(X x, User user, EmailMessage emailMessage, String templateName, Map templateArgs) {
    // EXIT CASES && VARIABLE SET UP
    if ( x == null ) return;
    Logger logger = (Logger) x.get("logger");
    if ( SafetyUtil.isEmpty(templateName) && emailMessage == null ) {
      logger.error("@EmailsUtility: no email message available to be sent"); // TODO put in meaning ful exception
      return;
    }
    String userGroupId = user != null ? user.getGroup() : "";
    EnvironmentConfiguration config = null;

    // STEP 1) Find EmailTemplate
    EmailTemplate emailTemplateObj = null;
    if ( ! SafetyUtil.isEmpty(templateName) ) {
      emailTemplateObj = DAOResourceLoader.findTemplate(x, templateName, userGroupId);
      if ( emailTemplateObj == null ) {
        logger.error("@EmailsUtility: emailTemplate not found and emailMessage is null. Invalid use of emailService");
        return;
      }
    } else {
      emailTemplateObj = new EmailTemplate();
    }

    // STEP 2) Apply Template to emailMessage and set all possible properties
    if ( emailTemplateObj.getId() != 0 ) {
      config = EnvironmentConfigurationBuilder
        .configuration()
          .resources()
            .resourceLoaders()
              .add(new TypedResourceLoader("dao", new DAOResourceLoader(x, userGroupId)))
              .and()
          .and()
        .build();
    }
    try {
      emailMessage = emailTemplateObj.apply(x, user, emailMessage, templateArgs, config);
      if ( emailMessage == null) {
        logger.warning("@EmailsUtility: emailTemplate.apply has returned null. Which implies an uncaught error");
      }
    } catch (Exception e) {
      logger.warning("@EmailsUtility: emailTemplate.apply has failed, with a thrown exception. ", e);
      return;
    }

    // STEP 3) passing emailMessage through to actual email service.
    DAO email = (DAO) x.get("emailMessageDAO");
    email.put(emailMessage);
  }

}
