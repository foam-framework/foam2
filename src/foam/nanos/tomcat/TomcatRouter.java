package foam.nanos.tomcat;

import foam.nanos.http.NanoRouter;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class TomcatRouter
  extends NanoRouter
{
  @Override
  protected synchronized void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    setX(ContextLocator.getX());
    super.service(req, resp);
  }
}
