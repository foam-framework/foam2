/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import com.sun.net.httpserver.*;
import foam.box.*;
import foam.core.*;
import foam.dao.*;
import foam.nanos.boot.NSpec;
import foam.nanos.logger.Logger;
import foam.nanos.pm.PM;
import java.io.IOException;
import java.net.URI;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import javax.servlet.http.HttpServlet;

public class NanoHttpHandler
  extends    ContextAwareSupport
  implements HttpHandler
{

  public NanoHttpHandler(X x) {
    setX(x);
  }

  @Override
  public void handle(HttpExchange exchange) throws IOException {
    ServletHandler sh = new ServletHandler((HttpServlet) getX().get("httprouter"));
    sh.handle(exchange);
  }
}
