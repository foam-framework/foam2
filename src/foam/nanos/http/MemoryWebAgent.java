/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.*;

import java.io.PrintWriter;
import javax.servlet.http.HttpServletRequest;
import java.lang.management.MemoryUsage;
import java.lang.Runtime;

public class MemoryWebAgent
    implements WebAgent
{
  public MemoryWebAgent() {}

  public static long bytesToMegabytes(long bytes) {
      long mb = 1024 * 1024;
      return bytes / mb;
  }

  public void execute(X x) {
    final PrintWriter out   = (PrintWriter) x.get(PrintWriter.class);
    Runtime runtime = Runtime.getRuntime();
    out.println("<HTML>");
    out.println("<HEAD><TITLE>Memory Usage (JVM)</TITLE></HEAD>\n");
    out.println("<BODY>");
    out.println("<H1>Memory Usage (JVM)</H1>\n");
    out.println("<pre>");
    runtime.gc();
    long memory = runtime.totalMemory() - runtime.freeMemory();
    
    out.println("Max memory in bytes: " + runtime.totalMemory());
    out.println("Max memory in megabytes: " + bytesToMegabytes(runtime.totalMemory()));
    out.println("</br>");
    out.println("Used memory in bytes: " + memory);
    out.println("Used memory in megabytes: " + bytesToMegabytes(memory));
    out.println("</br>");
    out.println("Free memory in bytes: " + runtime.freeMemory());
    out.println("Free memory in megabytes: " + bytesToMegabytes(runtime.freeMemory()));
    out.println("</br>");
    out.println("Available processors(cores): " + runtime.availableProcessors());
    out.println("</br>");
    out.println("</pre></BODY></HTML>");
  }
}