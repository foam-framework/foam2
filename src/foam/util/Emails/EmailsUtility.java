package foam.util.Emails;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.ChainedTemplateService;
import foam.nanos.notification.email.DAOResourceLoader;
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

    // Try to locate user group, from template
    Group group = user != null ? user.findGroup(x) : null;

    // 
    templateArgs.add("template", templateName);

    // TODO : call emailtemplateService and chained services and pass proper args ... group being one
    ChainedTemplateService cts = x.get("emailPropertyService");
    List propertyApplied = cts.getData();
    for ( EmailPropertyService eps: propertyApplied ) {
      emailMessage = eps.apply(x, group, emailMessage, templateArgs);
    }






    

    // STEP 3) passing emailMessage through to actual email service.
    DAO email = (DAO) x.get("emailMessageDAO");
    email.put(emailMessage);
  }

}
