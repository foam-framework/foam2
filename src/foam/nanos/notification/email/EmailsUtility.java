package foam.nanos.notification.email;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.nanos.app.EmailConfig;
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
    STEP 2) apply the template to the emailMessage,
    STEP 3) set defaults to emailMessage where property is empty,
    STEP 4) then to store and send the email we just have to pass the emailMessage through to actual email service.

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
    if ( x == null ) return;
    Logger logger = (Logger) x.get("logger");
    EmailTemplate emailTemplateObj = null;
    String userGroupId = "";

    // Try to account for a null passed in user
    if ( user == null && emailMessage != null && emailMessage.getTo().length > 1) {
      // try to find user from emailMessage. Assuming that the first user group applies to all that this email is being sent to.
      user = (User) ((DAO) x.get("localUserDAO")).where(EQ(User.EMAIL, emailMessage.getTo()[0])).select(new ArraySink());
    }

    // userGroupId will be used to find the correct template
    userGroupId = user == null ? "" : user.getGroup();

    // config is used by the DAOResourceLoader which is necessary for implementing Jtwig templating
    EnvironmentConfiguration config = EnvironmentConfigurationBuilder
      .configuration()
        .resources()
          .resourceLoaders()
          .add(new TypedResourceLoader("dao", new DAOResourceLoader(x, userGroupId)))
            .and()
          .and()
      .build();

    // If we have a templateName process the template
    if ( ! SafetyUtil.isEmpty(templateName) ) {
      // STEP 1) Find EmailTemplate
      emailTemplateObj = DAOResourceLoader.findTemplate(x, templateName, userGroupId);
      if ( emailMessage == null ) {
        // Need either an emailMessage or a template to create an email
        // checking here if above condition is met
        if ( emailTemplateObj != null ) {
          emailMessage = new EmailMessage();
        } else {
          logger.error("@EmailsUtility: emailTemplate not found and emailMessage is null. Invalid use of emailService");
          return;
        }
      }
    } else {
      // flow for no EmailTemplate given
      if ( emailMessage == null ) {
        // no template specified and no emailMessage means nothing to send.
        logger.error("@EmailsUtility: emailTemplate templateName missing and emailMessage is null. Invalid use of emailService");
        return;
      }
    }

    // Possible that emailTemplateObj is null and emailMessage was passed in for sending, without the use of a template.
    // in this case bypass step 2.
    if ( emailTemplateObj != null) {
      // STEP 2) Apply Template to emailMessage
      try {
        emailMessage = emailTemplateObj.apply(x, user, emailMessage, templateArgs, config);
        if ( emailMessage == null) {
          logger.warning("@EmailsUtility: emailTemplate.apply has returned null. Which implies an uncaught error");
        }
      } catch (Exception e) {
        logger.warning("@EmailsUtility: emailTemplate.apply has failed, with a thrown exception. ", e);
        return;
      }
    }

    // STEP 3) set defaults to properties that have not been set
    EmailConfig emailConfig = (EmailConfig) x.get("emailConfig");
    if ( SafetyUtil.isEmpty(emailMessage.getFrom()) ) {
      emailMessage.setFrom(emailConfig.getFrom());
    }
    if ( SafetyUtil.isEmpty(emailMessage.getDisplayName()) ) {
      emailMessage.setDisplayName(emailConfig.getDisplayName());
    }
    if ( SafetyUtil.isEmpty(emailMessage.getReplyTo()) ) {
      emailMessage.setReplyTo(emailConfig.getReplyTo());
    }

    // STEP 4) passing emailMessage through to actual email service.
    DAO email = (DAO) x.get("emailMessageDAO");
    email.put(emailMessage);
  }

}
