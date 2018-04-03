package foam.nanos.notification.email;

import foam.core.ContextAwareSupport;
import foam.nanos.NanoService;
import foam.nanos.notification.email.POP3Email;
import foam.core.X;

public class POP3EmailService
    extends ContextAwareSupport
    implements POP3Email, NanoService
{
  //Implement POP3 Fetch.
   public void start() {
      String username = "pat.dev.test1@gmail.com";// change accordingly
      String password = "Choose123";// change accordingly
   }
}