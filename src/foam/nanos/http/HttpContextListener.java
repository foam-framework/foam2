/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.nanos.boot.Boot;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.http.HttpServlet;

public abstract class HttpContextListener
  implements ServletContextListener
{
  @Override
  public void contextInitialized(ServletContextEvent servletContextEvent) {
    Boot boot_ = new Boot();
    Object o = boot_.getX().get("httprouter");
    if ( o != null && o instanceof HttpServlet) {
      servletContextEvent.getServletContext().addServlet("rout", (HttpServlet) o).addMapping("/");
    } else {
      System.out.println("Couldn't find httprouter servlet, exiting...");
      System.exit(1);
    }
  }
}
