package foam.nanos.notification.email;

import foam.core.X;
import foam.core.ContextAwareSupport;
import foam.nanos.NanoService;
import foam.nanos.notification.email.POP3Email;

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
    public static void fetch(String pop3Host, String storeType, String user, String password) {
      try {
         Properties properties = new Properties();
         properties.put("mail.store.protocol", "pop3");
         properties.put("mail.pop3.host", pop3Host);
         properties.put("mail.pop3.port", "995");
         properties.put("mail.pop3.starttls.enable", "true");
         Session emailSession = Session.getDefaultInstance(properties);
         emailSession.setDebug(true);

         Store store = emailSession.getStore("pop3s");

         store.connect(pop3Host, user, password);

         Folder emailFolder = store.getFolder("INBOX");
         emailFolder.open(Folder.READ_ONLY);

         
         BufferedReader reader = new BufferedReader(new InputStreamReader(
          System.in));

          

         Message[] messages = emailFolder.getMessages();
                  
         POP3Folder pop3Folder = (POP3Folder) emailFolder;
         System.out.println("messages.length---" + messages.length);
            
         for (int i = 0; i < messages.length; i++) {
            Message message = messages[i];
            System.out.println("---------------------------------");
            writePart(message);
            String emailId = pop3Folder.getUID(message);
            System.out.println("-------- EMAIL UID ----------");
            System.out.println(emailId);
            String line = reader.readLine();
            if ("YES".equals(line)) {
               message.writeTo(System.out);
            } else if ("QUIT".equals(line)) {
               break;
            }
         }
         emailFolder.close(false);
         store.close();

      } catch (NoSuchProviderException e) {
         e.printStackTrace();
      } catch (MessagingException e) {
         e.printStackTrace();
      } catch (IOException e) {
         e.printStackTrace();
      } catch (Exception e) {
         e.printStackTrace();
      }
   }
   public void start() {

      String host = "pop.gmail.com";
      String mailStoreType = "pop3";
      String username = "pat.dev.test1@gmail.com";
      String password = "Choose123";

      fetch(host, mailStoreType, username, password);
   }

   public static void writePart(Part p) throws Exception {
  if (p instanceof Message)
     writeEnvelope((Message) p);
      System.out.println("----------------------------");
      System.out.println("CONTENT-TYPE: " + p.getContentType());

      if (p.isMimeType("text/plain")) {
         System.out.println("This is plain text");
         System.out.println("---------------------------");
         System.out.println((String) p.getContent());
      } 
      else if (p.isMimeType("multipart/*")) {
         System.out.println("This is a Multipart");
         System.out.println("---------------------------");
         Multipart mp = (Multipart) p.getContent();
         int count = mp.getCount();
         for (int i = 0; i < count; i++)
            writePart(mp.getBodyPart(i));
      } 
      else if (p.isMimeType("message/rfc822")) {
         System.out.println("This is a Nested Message");
         System.out.println("---------------------------");
         writePart((Part) p.getContent());
      } 
       else if (p.isMimeType("image/jpeg")) {
       System.out.println("--------> image/jpeg");
          Object o = p.getContent();

          InputStream x = (InputStream) o;
          System.out.println("x.length = " + x.available());
          byte[] bArray = new byte[x.available()];
          int i = 0;
          while ((i = (int) ((InputStream) x).available()) > 0) {
            int result = (int) (((InputStream) x).read(bArray));
            if (result == -1)
            break;
      }
          FileOutputStream f2 = new FileOutputStream("/tmp/image.jpg");
          f2.write(bArray);
      } 
      else if (p.getContentType().contains("image/")) {
         System.out.println("content type" + p.getContentType());
         File f = new File("image" + new Date().getTime() + ".jpg");
         DataOutputStream output = new DataOutputStream(
            new BufferedOutputStream(new FileOutputStream(f)));
            com.sun.mail.util.BASE64DecoderStream test = 
                 (com.sun.mail.util.BASE64DecoderStream) p
                  .getContent();
         byte[] buffer = new byte[1024];
         int bytesRead;
         while ((bytesRead = test.read(buffer)) != -1) {
            output.write(buffer, 0, bytesRead);
         }
      } 
      else {
         Object o = p.getContent();
         if (o instanceof String) {
            System.out.println("This is a string");
            System.out.println("---------------------------");
            System.out.println((String) o);
         } 
         else if (o instanceof InputStream) {
            System.out.println("This is just an input stream");
            System.out.println("---------------------------");
            InputStream is = (InputStream) o;
            is = (InputStream) o;
            int c;
            while ((c = is.read()) != -1)
               System.out.write(c);
         } 
         else {
            System.out.println("This is an unknown type");
            System.out.println("---------------------------");
            System.out.println(o.toString());
         }
      }
   }
   public static void writeEnvelope(Message m) throws Exception {
      System.out.println("This is the message envelope");
      System.out.println("---------------------------");
      Address[] a;

      if ((a = m.getFrom()) != null) {
         for (int j = 0; j < a.length; j++)
         System.out.println("FROM: " + a[j].toString());
      }
      if ((a = m.getRecipients(Message.RecipientType.TO)) != null) {
         for (int j = 0; j < a.length; j++)
         System.out.println("TO: " + a[j].toString());
      }
      if (m.getSubject() != null)
         System.out.println("SUBJECT: " + m.getSubject());
   }

   private Email getMessageId(int id){
      Email message  = new Email();
      int length=getSize();
      int i=0;
      message=al.get(i);
      i++;
  try{
      while(message.getId()!=id && i<length)
          message=al.get(i);
          i++;
      if(message.getId()!=id)
          message=null;
          String emailId = folder.getId(message).toString(emailid);
                        if (emailId.equals(emailId)){
                              System.out.println("Your ids are matching...");
                        }
                        else{
                              System.out.println("check your id properly");
                        }
                  }
                        catch(Exception ex){
                        System.out.println("Following exception" + ex);
                        }
      return message;
   }

   public void reply() 
   {
      Date date = null;
      String emailId = "GmailId162c04e9c76e0b6c";
      Properties properties = new Properties();
      properties.put("mail.store.protocol", "pop3s");
      properties.put("mail.pop3s.host", "pop.gmail.com");
      properties.put("mail.pop3s.port", "995");
      properties.put("mail.pop3.starttls.enable", "true");
      properties.put("mail.smtp.auth", "true");
      properties.put("mail.smtp.starttls.enable", "true");
      properties.put("mail.smtp.host", "relay.jangosmtp.net");
      properties.put("mail.smtp.port", "25");
      Session session = Session.getDefaultInstance(properties);

      try 
      {
         Store store = session.getStore("pop3s");
         store.connect("pop.gmail.com", "pat.dev.test1@gmail.com","Choose123");

            Folder folder = store.getFolder("inbox");
         if (!folder.exists()) {
            System.out.println("inbox not found");
               System.exit(0);
         }
         folder.open(Folder.READ_ONLY);
      
         

         BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        Message[] messages = folder.getMessages();
            //Message message1 = folder.getMessage(emailId);
            Message message1 = folder.getMessageId(1);
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
               
              System.out.print("Do you want to reply to this email with ID [y/n] : ");
               String ans = reader.readLine();
               if ("Y".equals(ans) || "y".equals(ans)) {

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

               } else if ("n".equals(ans)) {
                  break;
               }
            }
            
         } else {
            System.out.println("There is no msg....");
         }
      } catch (Exception e) {
         e.printStackTrace();
      }
   }
}


