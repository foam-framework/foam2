package foam.nanos.tomcat;

import foam.nanos.boot.Boot;
import javax.servlet.http.HttpServlet;

public class BootServlet
  extends HttpServlet
{
  public BootServlet() {
    Boot boot = new Boot();
    ContextLocator.setX(boot.getX());
  }
}
