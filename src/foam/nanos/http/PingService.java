/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.*;
import foam.nanos.logger.Logger;
import java.io.PrintWriter;
import java.io.IOException;
import java.util.Date;

public class PingService
  implements WebAgent
{
  public PingService() {}

  @Override
  public void execute(X x) {
    PrintWriter out = x.get(PrintWriter.class);
    out.println("Pong: " + new Date());
  }

  public Long ping(X x, String hostname, int port)
    throws IOException {

    // TODO: control http/https
    String urlString = "http://" + hostname + ":" + port + "/service" + "/ping";

    Logger logger = (Logger) x.get("logger");
    logger.debug(this.getClass().getSimpleName(), urlString);

    java.net.HttpURLConnection conn = null;
    java.io.OutputStreamWriter output = null;

    Long startTime = System.currentTimeMillis();
    Long latency = 0L;

    try {
      java.net.URL url = new java.net.URL(urlString);
      conn = (java.net.HttpURLConnection)url.openConnection();
      conn.setDoOutput(true);
      conn.setRequestMethod("GET");
      //    conn.setRequestProperty("Accept", "application/json");
      //    conn.setRequestProperty("Content-Type", "application/json");

      output = new java.io.OutputStreamWriter(
                                              conn.getOutputStream(),
                                              java.nio.charset.StandardCharsets.UTF_8);

      output.write(System.getProperty("hostname", "localhost"));

      byte[] buf = new byte[8388608];
      java.io.InputStream input = conn.getInputStream();

      int off = 0;
      int len = buf.length;
      int read = -1;
      while ( len != 0 && ( read = input.read(buf, off, len) ) != -1 ) {
        off += read;
        len -= read;
      }
      latency = System.currentTimeMillis() - startTime;

      // expecting time stamp - is this still needed?
      if ( len == 0 && read != -1 ) {
        logger.debug("Invalid Ping Response: ", "zero length");
        throw new IOException("Invalid Ping Response.");
      }

      String str = new String(buf, 0, off, java.nio.charset.StandardCharsets.UTF_8);
      if ( ! str.startsWith("Pong") ) {
        logger.debug("Invalid Ping Response: ", str);
        throw new IOException("Invalid Ping Response.");
      }
      //Long t = Long.parseLong(str);
    } catch (Throwable e) {
      logger.warning(this.getClass().getSimpleName(), urlString, e.getMessage());
      throw e;
    } finally {
      if ( output != null ) {
        output.close();
      }
      // REVIEW: need to close HttpURLConnection?
    }
    return latency;
  }
}
