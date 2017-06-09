/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import com.sun.net.httpserver.*;
import foam.core.*;
import foam.nanos.*;
import java.io.IOException;
import java.net.InetSocketAddress;

public class NanoHttpServer
  extends    ContextAwareSupport
  implements NanoService
{

  protected HttpServer server_;
  protected int        port_ = 8080;

  public void start() {
    System.out.println("Starting HTTP Server on port " + port_);

    try {
      server_ = HttpServer.create(new InetSocketAddress(port_), 0);
    } catch(IOException e) {
       e.printStackTrace();
    }

    server_.createContext("/", new NanoHttpHandler(getX()));

    server_.start();
  }
}
