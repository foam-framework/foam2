package foam.nanos.http;

// Import required java libraries
import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;

// Extend HttpServlet class
public class UptimeServlet
  extends HttpServlet
{
  protected long startTime_ = System.currentTimeMillis();

  public void doGet(HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException
  {
    response.setContentType("text/html");

    PrintWriter out = response.getWriter();
    out.println("Uptime: " + (System.currentTimeMillis() - startTime_)/1000);
  }
}
