package foam.nanos.notification.email;

import foam.core.X;
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
 

import java.util.Properties;
import java.util.Objects;
import java.util.Date;
import java.lang.*;
import java.io.*;
import java.util.HashSet;
import java.util.Set;
 
import javax.mail.Address;
import javax.mail.Folder;
import javax.mail.Message;
import javax.mail.Message.RecipientType;
import javax.mail.MessagingException;
import javax.mail.NoSuchProviderException;
import javax.mail.Session;
import javax.mail.Store;
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
import javax.mail.UIDFolder;

import javax.activation.DataHandler;
import javax.activation.DataSource;
import javax.activation.FileDataSource;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.FileInputStream;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.BufferedOutputStream;
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.InputStreamReader;
import java.io.Reader;
import com.sun.mail.pop3.POP3Folder;

import java.lang.Object;

public class POP3EmailService extends ContextAwareSupport implements POP3Email, NanoService
{
 public POP3EmailService()
  {
    super();
  }

  //Implement POP3 Fetch.
   public void start() {

      String host = "pop.gmail.com";
      String mailStoreType = "pop3";
      String username = "pat.dev.test1@gmail.com";
      String password = "Choose123";

      fetch(host, mailStoreType, username, password);
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
