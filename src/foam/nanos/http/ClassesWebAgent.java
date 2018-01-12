/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.*;
import java.net.URL;
import java.net.URLClassLoader;
import java.io.PrintWriter;

public class ClassesWebAgent
  implements WebAgent
{
  public ClassesWebAgent() {}

  public void execute(X x) {
    final PrintWriter out  = x.get(PrintWriter.class);

    out.println("<pre>");
    ClassLoader cl = ClassLoader.getSystemClassLoader();

    URL[] urls = ((URLClassLoader) cl).getURLs();

    for ( URL url : urls ) {
      out.println(url.getFile());
    }

    out.println("</pre>");
  }
}
