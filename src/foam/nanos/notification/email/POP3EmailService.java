package foam.nanos.notification.email;

import foam.core.ContextAwareSupport;
import foam.nanos.NanoService;
import foam.nanos.notification.email.POP3Email;
import foam.core.X;
import java.util.Properties;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.mail.Folder;
 

public class POP3EmailService
    extends ContextAwareSupport
    implements POP3Email, NanoService
{
 public POP3EmailService()
  {
    super();
  }

  //Implement POP3 Fetch.
   public void start() {
      String username = "pat.dev.test1@gmail.com";// change accordingly
      String password = "Choose123";// change accordingly
   }
  
   public String sendEmail(String requestor,String subject,String body){  
      String host = "pop.gmail.com";// change accordingly
      String mailStoreType = "pop3";
      String username = "pat.dev.test1@gmail.com";// change accordingly
      String password = "Choose123";// change accordingly
      Properties props = new Properties();
      props.put("mail.smtp.auth", "true");
      props.put("mail.smtp.starttls.enable", "true");
      props.put("mail.smtp.host", host);
      props.put("mail.smtp.port", "25");
      Session session = Session.getInstance(props,
         new javax.mail.Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
               return new PasswordAuthentication(username, password);
	   }
         });

       try {
        Transport transport = session.getTransport("smtp");
        transport.connect("smtp.gmail.com", 25, username, password);
	   // Create a default MimeMessage object.
	   Message message = new MimeMessage(session);
	
	   // Set From: header field of the header.
	   message.setFrom(new InternetAddress("pat.dev.test1@gmail.com"));
	
	   // Set To: header field of the header.
	   message.setRecipients(Message.RecipientType.TO,
               InternetAddress.parse(requestor));
	
	   // Set Subject: header field
	   message.setSubject(subject);
	
	   // Now set the actual message
	   message.setText(body);


	   // Send message
	   transport.sendMessage(message,message.getAllRecipients());
     System.out.println("Sent message successfully....");
     String messageID = ((MimeMessage) message).getMessageID();
     return messageID;
      } catch (MessagingException e) {
         throw new RuntimeException(e);
      }
   }
}