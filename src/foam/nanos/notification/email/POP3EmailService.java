package foam.nanos.notification.email;

import foam.core.X;
import foam.core.ContextAwareSupport;
import foam.dao.DAO;
import foam.nanos.NanoService;
import foam.dao.ArraySink;
import foam.nanos.notification.email.POP3Email;
import foam.support.model.Ticket;
import static foam.mlang.MLang.*;

import java.util.Properties;
import java.util.Objects;
import java.util.Date;
import java.lang.*;
import java.util.List;
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
import com.sun.mail.imap.IMAPFolder;

import java.lang.Object;

public class POP3EmailService extends ContextAwareSupport implements POP3Email, NanoService
{
  public void fetch(String pop3Host, String storeType, String user, String password) {
    DAO ticketDAO = (DAO) getX().get("ticketDAO");

    try {
      Properties properties = new Properties();
      properties.setProperty("mail.store.protocol", "imaps");
      // properties.put("mail.store.protocol", "pop3");
      properties.put("mail.pop3.host", pop3Host);
      properties.put("mail.pop3.port", "995");
      properties.put("mail.pop3.starttls.enable", "true");
      Session emailSession = Session.getDefaultInstance(properties);
      emailSession.setDebug(true);

      Store store = emailSession.getStore("imaps");

      store.connect(pop3Host, user, password);
      Folder emailFolder = store.getFolder("INBOX");
      emailFolder.open(Folder.READ_ONLY);
      Message[] messages = emailFolder.getMessages();
              
      IMAPFolder imapfolder = (IMAPFolder) emailFolder;
      System.out.println("messages.length---" + messages.length);
        
      for (int i = 0; i < messages.length; i++) {
        Message message = messages[i];
        long emailId = imapfolder.getUID(message);
        System.out.println("--------emailId--------");
        // iterate through tickets from the ticketDAO, compare emailId on ticket, if its not there create new ticket
        // by setting the ticket emailId to the emailId from the imapfolder.getUID() method.
        // and putting to  TicketDAO

        try{ 
          ArraySink sink = (ArraySink) ticketDAO.where(
          AND(
            EQ(Ticket.EMAIL_ID)
          )
        ).select(new ArraySink());
          List ticketList = sink.getArray();
          System.out.println(ticketList); 

        }
        catch ( Throwable e ) {
         
        }


        System.out.println(emailId);
      }
      emailFolder.close(false);
      store.close();
    } catch (Exception e) {
        e.printStackTrace();
    }
  }

  

  private Message getMessageById(String id, Message[] messages, IMAPFolder folder){
    String uidString = null;
    for (int j = 0; j < messages.length; j++){
      try {
        uidString = "folder.getUID(messages[j]);";
        System.out.println(uidString);
        if ( id == uidString ){
          return messages[j];
        }
      } catch(Exception e){
        System.out.println(e);
      }
    }
    return null;
  }
  public void reply(){
    Date date = null;
    String emailId = "GmailId162d463489abf2d7";
    Properties properties = new Properties();
    // properties.put("mail.store.protocol", "pop3s");
    properties.setProperty("mail.store.protocol", "imaps");
    properties.put("mail.pop3s.host", "pop.gmail.com");
    properties.put("mail.pop3s.port", "995");
    properties.put("mail.pop3.starttls.enable", "true");
    properties.put("mail.smtp.auth", "true");
    properties.put("mail.smtp.starttls.enable", "true");
    properties.put("mail.smtp.host", "relay.jangosmtp.net");
    properties.put("mail.smtp.port", "25");
    Session session = Session.getDefaultInstance(properties);
    try {
      Store store = session.getStore("imaps");

      // Store store = session.getStore("pop3s");
      store.connect("pop.gmail.com", "pat.dev.test1@gmail.com","Choose123");
      Folder folder = store.getFolder("inbox");
      if (!folder.exists()) {
        System.out.println("inbox not found");
        System.exit(0);
      }
      folder.open(folder.READ_WRITE);    

      Message[] messages = folder.getMessages();
      for (int i = 0, n = messages.length; i < n; i++){
        System.out.println("------------!!!!!!Here's a message!!!!!!!!!---------");
        System.out.println(messages[i].getSubject());
      }
      IMAPFolder imapfolder = (IMAPFolder) folder;

      System.out.println("Message fetched is here:");
      Message message1 = getMessageById(emailId, messages, imapfolder);
      if (message1 == null){
        System.out.println("............. !No Email Found! .........");
        return;
      }
      System.out.println("............. !MESSAGE WITH EMAIL ID FETCHED! .........");
      System.out.println(message1.getSubject());
      if (messages.length != 0 ) {
        for (int i = 0, n = messages.length; i < n; i++) {
          Message message = messages[i];
          date = message.getSentDate();
          String from = InternetAddress.toString(message.getFrom());
    
      
          if (from != null) {
            System.out.println("From: " + from);
          }
          String replyTo = InternetAddress.toString(message
        .getReplyTo());
          if (replyTo != null) {
            System.out.println("Reply-to: " + replyTo);
          }
          String to = InternetAddress.toString(message
        .getRecipients(Message.RecipientType.TO));
          if (to != null) {
            System.out.println("To: " + to);
          }
          String subject = message.getSubject();
          if (subject != null) {
            System.out.println("Subject: " + subject);
          }
          Date sent = message.getSentDate();
          if (sent != null) {
            System.out.println("Sent: " + sent);
          }else{
            System.out.println("Please verify your emailID" + emailId);
          }

            Message replyMessage = new MimeMessage(session);
            replyMessage = (MimeMessage) message.reply(false);
            // emailId = emailFromUser;
            //replyMessage.setFrom(new InternetAddress(this.emailId));
            replyMessage.setFrom(new InternetAddress(to));
            replyMessage.setText("Thanks");
            replyMessage.setReplyTo(message.getReplyTo());
            Transport t = session.getTransport("smtp");
            try {
                t.connect("abc", "****");
                t.sendMessage(replyMessage,
              replyMessage.getAllRecipients());
            } finally {
              t.close();
            }
              System.out.println("message replied successfully ....");
              folder.close(false);
              store.close();
            }
          }            
    } catch (Exception e) {
      e.printStackTrace();
    }
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
