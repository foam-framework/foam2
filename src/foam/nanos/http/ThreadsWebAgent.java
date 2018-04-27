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

  private String removeJavaBaseClass(String str){
    return str.substring(str.indexOf("/") + 1);
  }

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

    int parkedThreads    = 0;
    int sleepingThreads  = 0;
    out.println("<table style=\"width: 100%\">");
    out.println("<tr>");
    out.println("<th style=\"text-align: left\">Thread Name</th>");
    out.println("<th>Last Method Call</th>");
    out.println("</tr>");
    for ( Thread thread : threadArray ){
      StackTraceElement[] elements  = thread.getStackTrace();
      String methodName             = null;

      if ( elements.length > 0 ) {
        methodName = elements[0].getMethodName();

        switch ( methodName ) {
          case "park":
            parkedThreads += 1;
            continue;
          case "sleep":
            sleepingThreads += 1;
            methodName = removeJavaBaseClass(elements[0].toString());
            break;
          default:
            methodName = removeJavaBaseClass(elements[0].toString());
            break;
        }
      } else {
        methodName = "Unscheduled";
      }

      out.println("<tr>");
      out.println("<td>");
      out.println("<a href=\"threads?id="+ thread.getId() + "\">" + thread.toString() + "</a>");
      out.println("</td>");
      out.println("<td>");
      out.println(methodName);
      out.println("</td>");
      out.println("<tr>");
    }
    out.println("</table>");

    out.println("<br><br><H2>Summary</H2>\n");
    out.format("Total Threads : %d ; Parked Threads (not listed) : %d ; Sleeping Threads : %d ; Other Threads : %d", threadArray.length, parkedThreads, sleepingThreads, (threadArray.length - parkedThreads - sleepingThreads));

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
