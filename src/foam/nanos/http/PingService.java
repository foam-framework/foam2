/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import com.sun.net.httpserver.*;
import java.io.*;
import java.util.Date;

public class PingService
  implements HttpHandler
{
  public PingService() {}

  @Override
  public void handle(HttpExchange t) throws IOException {
    System.out.println("Pong");
    String response = "Pong: " + new Date();
    t.sendResponseHeaders(200, response.length());
    OutputStream os = t.getResponseBody();
    os.write(response.getBytes());
    os.close();
  }
}
