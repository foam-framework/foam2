/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.*;
import java.io.PrintWriter;
import java.lang.management.MemoryUsage;
import java.lang.Runtime;
import javax.servlet.http.HttpServletRequest;

/** Display memory usage statistics. **/
public class MemoryWebAgent
  implements WebAgent
{
  final static long MB = 1024 * 1024;

  public MemoryWebAgent() {}

  public static long bytesToMegabytes(long bytes) {
    return bytes / MB;
  }

  public void execute(X x) {
    PrintWriter out     = x.get(PrintWriter.class);
    Runtime     runtime = Runtime.getRuntime();

    out.println("<HTML>");
    out.println("<HEAD><TITLE>Memory Usage (JVM)</TITLE></HEAD>\n");
    out.println("<BODY>");
    out.println("<H1>Memory Usage (JVM)</H1>\n");
    out.println("<pre>");

    // Takes two calls for force a GC.
    runtime.gc();
    runtime.gc();

    long memory = runtime.totalMemory() - runtime.freeMemory();

    out.println("Total memory in bytes: " + runtime.totalMemory());
    out.println("Total memory in megabytes: " + bytesToMegabytes(runtime.totalMemory()));
    out.println("</br>");
    out.println("Max memory in bytes: " + runtime.maxMemory());
    out.println("Max memory in megabytes: " + bytesToMegabytes(runtime.maxMemory()));
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
