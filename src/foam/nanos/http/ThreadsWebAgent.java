/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.*;
import java.lang.Thread;
import java.lang.StackTraceElement;
import java.lang.String;
import java.util.Set;
import java.io.PrintWriter;
import javax.servlet.http.HttpServletRequest;

public class ThreadsWebAgent
  implements WebAgent
{
  public ThreadsWebAgent() {}

  public void execute(X x) {
    final PrintWriter out  = (PrintWriter) x.get(PrintWriter.class);
    final HttpServletRequest req = (HttpServletRequest) x.get(HttpServletRequest.class);

    Set<Thread> threadSet = Thread.getAllStackTraces().keySet();

    Thread[] threadArray = threadSet.toArray(new Thread[threadSet.size()]);
    out.println("<HEAD><TITLE>Threads</TITLE></HEAD>\n");
    out.println("<HTML><BODY>");
    out.println("<pre>");
    out.println("<H1>Threads</H1>\n");

    for ( Thread thread : threadArray ){
      out.println("<a href=\"threads?id="+ thread.getId() + "\">" + thread.toString() + "</a>");
    }

    String param = req.getParameter("id");
    if( param != null && !param.isEmpty() ){
      out.println("<H1>Stack Trace</H1>\n");
      
      for ( Thread thread : threadArray ){
        Long id = new Long(thread.getId());

        if( param.equals(id.toString()) ){
          out.println("<H4>Thread: " + thread.getName() + "</H4>\n");
          StackTraceElement[] elements = thread.getStackTrace();

          for( StackTraceElement element : elements ) {
            out.println(element.toString());
          }
          break;
        }
      }
    }
    out.println("</pre>");
    out.println("</BODY></HTML>");
  }
}