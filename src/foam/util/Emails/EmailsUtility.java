package foam.util.Emails;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.app.AppConfig;
import foam.nanos.notification.email.EmailConfig;
import foam.nanos.app.SupportConfig;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailPropertyService;
import foam.nanos.theme.Theme;
import foam.nanos.theme.Themes;
import foam.util.SafetyUtil;
import java.util.HashMap;
import java.util.Map;

public class EmailsUtility {
  /*
  documentation:
  Purpose of this function/service is to facilitate the population of an email properties and then to actually send the email.
    STEP 1) EXIT CASES && VARIABLE SET UP
    STEP 2) SERVICE CALL: to fill in email properties.
    STEP 3) SERVICE CALL: passing emailMessage through to actual email service.

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

    if ( emailMessage == null ) {
      if ( SafetyUtil.isEmpty(templateName) ) {
        logger.error("@EmailsUtility: no email message available to be sent");
        return;
      }
      emailMessage = new EmailMessage();
    }

    X userX = x;
    String group = "";
    String spid = null;
    AppConfig appConfig = (AppConfig) x.get("appConfig");
    if ( user != null ) {
      userX = x.put("subject", new Subject.Builder(x).setUser(user).build());
      group = user.getGroup();
      appConfig = user.findGroup(x).getAppConfig(x);
      spid = user.getSpid();
    }

    Theme theme = (Theme) x.get("theme");
    if ( theme == null
      || ( user != null && ! user.getSpid().equals(x.get("spid")) )
    ) {
      theme = ((Themes) x.get("themes")).findTheme(userX);
    }
    if ( spid == null ) {
      spid = theme.getSpid();
    }

    if ( theme.getAppConfig() != null ) {
      appConfig.copyFrom(theme.getAppConfig());
    }
    userX = userX.put("appConfig", appConfig);

    if ( SafetyUtil.isEmpty(emailMessage.getSpid()) ) {
      emailMessage.setSpid(user.getSpid());
    }

    SupportConfig supportConfig = theme.getSupportConfig();
    EmailConfig emailConfig = supportConfig.getEmailConfig();
    if ( emailConfig == null ) {
      emailConfig = (EmailConfig) ((DAO) userX.get("emailConfigDAO")).find(spid);
    }
    // Set ReplyTo, From, DisplayName from support email config
    if ( emailConfig != null ) {
      // REPLY TO:
      if ( ! SafetyUtil.isEmpty(emailConfig.getReplyTo()) ) {
        emailMessage.setReplyTo(emailConfig.getReplyTo());
      }

      // DISPLAY NAME:
      if ( ! SafetyUtil.isEmpty(emailConfig.getDisplayName()) ) {
        emailMessage.setDisplayName(emailConfig.getDisplayName());
      }

      // FROM:
      if ( ! SafetyUtil.isEmpty(emailConfig.getFrom()) ) {
        emailMessage.setFrom(emailConfig.getFrom());
      }
    }

    // Add template name to templateArgs, to avoid extra parameter passing
    if ( ! SafetyUtil.isEmpty(templateName) ) {
      if ( templateArgs != null ) {
        templateArgs.put("template", templateName);
      } else {
        templateArgs = new HashMap<>();
        templateArgs.put("template", templateName);
      }

      String url = appConfig.getUrl().replaceAll("/$", "");
      templateArgs.put("logo", (url + "/" + theme.getLogo()));
      templateArgs.put("appLink", url);
      templateArgs.put("appName", (theme.getAppName()));

      templateArgs.put("locale", user.getLanguage().getCode().toString());
  
      foam.nanos.auth.Address address = supportConfig.getSupportAddress();
      templateArgs.put("supportAddress", address == null ? "" : address.toSummary());
      templateArgs.put("supportPhone", (supportConfig.getSupportPhone()));
      templateArgs.put("supportEmail", (supportConfig.getSupportEmail()));
  
      // personal support user
      User psUser = supportConfig.findPersonalSupportUser(x);
      templateArgs.put("personalSupportPhone", psUser == null ? "" : psUser.getPhoneNumber());
      templateArgs.put("personalSupportEmail", psUser == null ? "" : psUser.getEmail());
      templateArgs.put("personalSupportFirstName", psUser == null ? "" : psUser.getFirstName());
      templateArgs.put("personalSupportFullName", psUser == null ? "" : psUser.getLegalName());
      
      emailMessage.setTemplateArguments(templateArgs);
    }

    // SERVICE CALL: to fill in email properties.
    EmailPropertyService cts = (EmailPropertyService) x.get("emailPropertyService");
    try {
      cts.apply(userX, group, emailMessage, templateArgs);
    } catch (Exception e) {
      logger.error(e);
      return;
    }

    // SERVICE CALL: passing emailMessage through to actual email service.
    DAO email = ((DAO) x.get("localEmailMessageDAO")).inX(x);
    emailMessage.setStatus(foam.nanos.notification.email.Status.UNSENT);
    email.put(emailMessage);
  }
}
