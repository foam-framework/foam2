package foam.nanos.notification.email;

import foam.core.ContextAwareSupport;
import foam.nanos.NanoService;
import foam.nanos.notification.email.POP3Email;
import foam.core.X;

import java.util.Properties;

import javax.mail.Folder;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.NoSuchProviderException;
import javax.mail.Session;
import javax.mail.Store;
import javax.mail.Address;
import javax.mail.Folder;
import javax.mail.Message;
import javax.mail.Message.RecipientType;
import javax.mail.MessagingException;
import javax.mail.NoSuchProviderException;
import javax.mail.Session;
import javax.mail.Store;
import javax.activation.DataHandler;
import javax.activation.DataSource;
import javax.activation.FileDataSource;
import javax.mail.BodyPart;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.mail.Part;


public class POP3EmailService extends ContextAwareSupport implements POP3Email, NanoService
{

public static void check(String host, String storeType, String user,
  String password) 
{
  try {

  Properties properties = new Properties();
       properties.put("mail.store.protocol", "pop3");
         properties.put("mail.pop3.host", pop3Host);
         properties.put("mail.pop3.port", "995");
         properties.put("mail.pop3.starttls.enable", "true");
         Session emailSession = Session.getDefaultInstance(properties);
         emailSession.setDebug(true);

  Store store = emailSession.getStore("pop3s");

  store.connect(host, user, password);

  Folder emailFolder = store.getFolder("INBOX");
  emailFolder.open(Folder.READ_ONLY);

  Message[] messages = emailFolder.getMessages();
  System.out.println("messages.length---" + messages.length);

  for (int i = 0, n = messages.length; i < n; i++) {
     Message message = messages[i];
     System.out.println("---------------------------------");
     System.out.println("Email Number " + (i + 1));
     System.out.println("Subject: " + message.getSubject());
     System.out.println("From: " + message.getFrom()[0]);
     System.out.println("Text: " + message.getContent().toString());

  }

  emailFolder.close(false);
  store.close();

  } catch (NoSuchProviderException e) {
     e.printStackTrace();
  } catch (MessagingException e) {
     e.printStackTrace();
  } catch (Exception e) {
     e.printStackTrace();
  }
}

public static void main(String[] args) {

  String host = "pop.gmail.com";// change accordingly
  String mailStoreType = "pop3";
  String username = "pat.dev.test1@gmail.com";// change accordingly
  String password = "Choose123";// change accordingly

  check(host, mailStoreType, username, password);

}

}