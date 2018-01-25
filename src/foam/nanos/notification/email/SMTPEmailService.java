package foam.nanos.notification.email;

import foam.core.ContextAgent;
import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.nanos.NanoService;
import foam.nanos.auth.User;
import foam.nanos.pool.FixedThreadPool;
import org.apache.commons.lang3.StringUtils;
import org.jtwig.JtwigModel;
import org.jtwig.JtwigTemplate;
import org.jtwig.environment.EnvironmentConfiguration;
import org.jtwig.environment.EnvironmentConfigurationBuilder;
import org.jtwig.resource.loader.TypedResourceLoader;

import javax.mail.Message;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.util.Date;
import java.util.Map;
import java.util.Properties;

public class SMTPEmailService
  extends ContextAwareSupport
  implements EmailService, NanoService
{
  private class SMTPAuthenticator extends javax.mail.Authenticator {
    @Override
    protected PasswordAuthentication getPasswordAuthentication() {
      return new PasswordAuthentication(username_, password_);
    }
  }

  protected Session session_ = null;
  protected EnvironmentConfiguration config_ = null;

  protected String host_;
  protected String port_;
  protected boolean authenticate_;
  protected boolean starttls_;
  protected String username_;
  protected String password_;

  public static class Builder
      extends ContextAwareSupport
  {
    private String host_ = "127.0.0.1";
    private String port_ = "25";
    private boolean authenticate_ = false;
    private boolean starttls_ = false;
    private String username_ = null;
    private String password_ = null;

    public Builder(X x) {
      setX(x);
    }

    public Builder setHost(String host) {
      host_ = host;
      return this;
    }

    public Builder setPort(String port) {
      port_ = port;
      return this;
    }

    public Builder setAuthenticate(boolean authenticate) {
      authenticate_ = authenticate;
      return this;
    }

    public Builder setStartTLS(boolean starttls) {
      starttls_ = starttls;
      return this;
    }

    public Builder setUsername(String username) {
      username_ = username;
      return this;
    }

    public Builder setPassword(String password) {
      this.password_ = password;
      return this;
    }

    public SMTPEmailService build() {
      return new SMTPEmailService(getX(), this);
    }
  }

  protected SMTPEmailService(X x, Builder builder) {
    setX(x);
    host_ = builder.host_;
    port_ = builder.port_;
    authenticate_ = builder.authenticate_;
    starttls_ = builder.starttls_;
    username_ = builder.username_;
    password_ = builder.password_;
  }

  public EnvironmentConfiguration getConfig(String group) {
    if ( config_ == null ) {
      config_ = EnvironmentConfigurationBuilder
          .configuration()
          .resources()
          .resourceLoaders()
          .add(new TypedResourceLoader("dao", new DAOResourceLoader(getX(), group)))
          .and().and()
          .build();
    }
    return config_;
  }

  @Override
  public void start() {
    Properties props = new Properties();
    props.setProperty("mail.smtp.auth", authenticate_ ? "true" : "false");
    props.setProperty("mail.smtp.starttls.enable", starttls_ ? "true" : "false");
    props.setProperty("mail.smtp.host", host_);
    props.setProperty("mail.smtp.port", port_);
    if ( authenticate_ ) {
      session_ = Session.getInstance(props, new SMTPAuthenticator());
    } else {
      session_ = Session.getInstance(props);
    }
  }

  @Override
  public void sendEmail(final EmailMessage emailMessage) {
    FixedThreadPool threadPool = (FixedThreadPool) getX().get("threadPool");
    threadPool.submit(getX(), new ContextAgent() {
      @Override
      public void execute(X x) {
        try {
          MimeMessage message = createMimeMessage(emailMessage);
          if ( message == null ) {
            return;
          }

          // send message
          Transport transport = session_.getTransport("smtp");
          transport.connect();
          transport.sendMessage(message, message.getAllRecipients());
          transport.close();
        } catch (Throwable t) {
          t.printStackTrace();
        }
      }
    });
  }

  @Override
  public void sendEmailFromTemplate(User user, EmailMessage emailMessage, String name, Map<String, Object> templateArgs) {
    String group = user != null ? (String) user.getGroup() : null;
    EmailTemplate emailTemplate = DAOResourceLoader.findTemplate(getX(), name, group);
    if ( emailMessage == null )
      return;

    EnvironmentConfiguration config = getConfig(group);
    JtwigTemplate template = JtwigTemplate.inlineTemplate(emailTemplate.getBody(), config);
    JtwigModel model = JtwigModel.newModel(templateArgs);
    emailMessage.setSubject(emailTemplate.getSubject());
    emailMessage.setBody(template.render(model));
    sendEmail(emailMessage);
  }

  protected MimeMessage createMimeMessage(EmailMessage emailMessage) {
    try {
      MimeMessage message = new MimeMessage(session_);

      // don't send email if no sender
      String from = emailMessage.getFrom();
      if ( from == null || from.isEmpty() )
        return null;
      message.setFrom(new InternetAddress(from));

      // don't send email if no subject
      String subject = emailMessage.getSubject();
      if ( subject == null || subject.isEmpty() )
        return null;
      message.setSubject(subject);

      // don't send email if no body
      String body = emailMessage.getBody();
      if ( body == null || body.isEmpty() )
        return null;
      message.setContent(body, "text/html; charset=utf-8");

      // don't send email if no recipient
      String[] to = emailMessage.getTo();
      if ( to == null || to.length <= 0 )
        return null;

      if ( to.length == 1 ) {
        message.setRecipient(Message.RecipientType.TO, new InternetAddress(to[0], false));
      } else {
        message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(StringUtils.join(to, ",")));
      }

      // send email even if no CC
      String[] cc = emailMessage.getCc();
      if ( cc != null && cc.length == 1 ) {
        message.setRecipient(Message.RecipientType.CC, new InternetAddress(cc[0], false));
      } else if ( cc != null && cc.length > 1 ) {
        message.setRecipients(Message.RecipientType.CC, InternetAddress.parse(StringUtils.join(cc, ",")));
      }

      // send email even if no BCC
      String[] bcc = emailMessage.getBcc();
      if ( bcc != null && bcc.length == 1 ) {
        message.setRecipient(Message.RecipientType.BCC, new InternetAddress(bcc[0], false));
      } else if ( bcc != null && bcc.length > 1 ) {
        message.setRecipients(Message.RecipientType.BCC, InternetAddress.parse(StringUtils.join(bcc, ",")));
      }

      // set date
      message.setSentDate(new Date());
      return message;
    } catch (Throwable t) {
      t.printStackTrace();
      return null;
    }
  }
}