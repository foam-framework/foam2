package foam.nanos.notification.email;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailTemplate;
import foam.util.SafetyUtil;
import org.jtwig.environment.EnvironmentConfiguration;
import org.jtwig.environment.EnvironmentConfigurationBuilder;
import org.jtwig.resource.loader.TypedResourceLoader;

public class EmailsUtility extends ContextAwareSupport {

  protected EnvironmentConfiguration config_ = null;

  /*
  documentation: 
  Purpose of this function/service is to facilitate the populations of an email and then to actually send the email. 
    STEP 1) find the EmailTemplate,
    STEP 2) apply the template to the emailMessage,
    STEP 3) set defaults to emailMessage where property is empty,
    STEP 4) then to store and send the email we just have to do a dao.put.
  */
  public EmailMessage sendEmailFromTemplate(X x, User user, EmailMessage emailMessage, String name, Map templateArgs) {
    Logger logger = (Logger) x.get("logger");
    EmailTemplate emailTemplateObj = null;

    if ( user == null && (emailMessage == null || SafetyUtil.isEmpty(emailMessage.getTo()[0]) ) ) {
      logger.warning("user and emailMessage.getTo() is not set. Email can't magically know where to go.", new Exception());
      return;
    }

    EnvironmentConfiguration config = getConfig(user.getGroup());

    if ( ! SafetyUtil.isEmpty(name) && user != null) {

      // STEP 1) Find EmailTemplate
      emailTemplateObj = DAOResourceLoader.findTemplate(getX(), name, user.getGroup());
      if ( emailMessage == null ) {
        if ( emailTemplateObj != null ) {
          emailMessage = new EmailMessage();
        } else {
          logger.warning("emailTemplate not found and emailMessage is null. Invalid use of emailService", new Exception());
          return;
        }
      }
    } else {
      if ( emailMessage == null ) {
        // no template specified and no emailMessage means nothing to send.
        logger.warning("emailTemplate name missing and emailMessage is null. Invalid use of emailService", new Exception());
        return;
      }
    }

    // emailMessage not null if we have reached here

    // Possible that emailTemplateObj is null and emailMessage was passed in for sending, without the use of a template.
    // in this case bypass step 2.
    if ( emailTemplateObj != null) {

      // STEP 2) Apply Template to emailMessage

      try {
        emailMessage = emailTemplateObj.apply(x, user, emailMessage, templateArgs, config);
        if ( emailMessage == null) {
          logger.warning("emailTemplate.apply has returned null. Which implies an uncaught error", new Exception());
        }
      } catch (Exception e) {
        logger.warning("emailTemplate.apply has failed, with a caught exception", e);
        return;
      }
    }

    // STEP 3) set defaults to properties that have not been set
    AppConfig appConfig = (AppConfig) getX().get("appConfig");
    if ( SafetyUtil.isEmpty(emailMessage.getFrom()) ) {
      emailMessage.setFrom(appConfig.getEmailsFrom());
    }
    if ( SafetyUtil.isEmpty(emailMessage.getDisplayName()) ) {
      emailMessage.setDisplayName(appConfig.getEmailsDisplayName());
    }
    if ( SafetyUtil.isEmpty(emailMessage.getReplyTo()) ) {
      emailMessage.setReplyTo(appConfig.getEmailsReplyTo());
    }

    // STEP 4) return populated emailMessage
    return emailMessage;
  }

  private void getConfig(String groupId) {
    if ( config_ == null ) {
      config_ = EnvironmentConfigurationBuilder
        .configuration()
        .resources()
          .resourceLoaders()
            .add(new TypedResourceLoader("dao", new DAOResourceLoader(getX(), groupId)))
          .and()
        .and()
      .build();
    }
    return config_;
  }

}