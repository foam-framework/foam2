/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.*;
import foam.util.SafetyUtil;

import java.io.PrintWriter;
import java.lang.StackTraceElement;
import java.lang.String;
import java.lang.Thread;
import java.util.Set;
import javax.servlet.http.HttpServletRequest;

public class ThreadsWebAgent
    implements WebAgent
{
  public ThreadsWebAgent() {}

  public void execute(X x) {
    PrintWriter        out         = x.get(PrintWriter.class);
    HttpServletRequest req         = x.get(HttpServletRequest.class);
    Set<Thread>        threadSet   = Thread.getAllStackTraces().keySet();
    Thread[]           threadArray = threadSet.toArray(new Thread[threadSet.size()]);

    out.println("<HTML>");
    out.println("<HEAD><TITLE>Threads</TITLE></HEAD>\n");
    out.println("<BODY>");
    out.println("<H1>Threads</H1>\n");
    out.println("<pre>");

    for ( Thread thread : threadArray ){
      out.println("<a href=\"threads?id="+ thread.getId() + "\">" + thread.toString() + "</a>");
      StackTraceElement[] elements = thread.getStackTrace();

      if ( elements.length > 0 ) {
        out.println(elements[0].toString());
      } else {
        out.println("This thread has not started, has started but not yet been scheduled to run, or has terminated.");
      }
    }

    String param = req.getParameter("id");
    if ( ! SafetyUtil.isEmpty(param) ) {
      out.println("<br><br><H2>Stack Trace</H2>\n");

      for ( Thread thread : threadArray ) {
        Long id = new Long(thread.getId());

        if ( param.equals(id.toString()) ) {
          out.println("<b>Thread: " + thread.getName() + "</b>\n");
          StackTraceElement[] elements = thread.getStackTrace();

          if ( elements.length > 0 ) {
            for ( StackTraceElement element : elements ) {
              out.println(element.toString());
            }
          } else {
            out.println("This thread has not started, has started but not yet been scheduled to run, or has terminated.");
          }
          break;
        }
      }
    }

    out.println("</pre></BODY></HTML>");
  }
}
