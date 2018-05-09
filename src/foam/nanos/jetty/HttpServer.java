package foam.nanos.jetty;

public class HttpServer
  extends foam.core.ContextAwareSupport
  implements foam.nanos.NanoService {

  public void start() {
    org.eclipse.jetty.server.Server server =
      new org.eclipse.jetty.server.Server(8080);

    org.eclipse.jetty.servlet.ServletContextHandler context = new
      org.eclipse.jetty.servlet.ServletContextHandler();

    context.setContextPath("/");

    org.eclipse.jetty.servlet.ServletHolder holder = new
      org.eclipse.jetty.servlet.ServletHolder((javax.servlet.http.HttpServlet)getX().get("httprouter"));

    context.addServlet(holder, "/*");
    
    try {
      server.setHandler(context);
      server.start();
    } catch(Exception e) {
      e.printStackTrace();
    }
  }
}
