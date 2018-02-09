/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.Detachable;
import foam.core.FObject;
import foam.lib.Outputter;
import org.apache.commons.io.IOUtils;
import org.apache.http.HttpException;

import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class HTTPSink
    extends AbstractSink
{
  protected String url_;
  protected Outputter outputter_;

  public HTTPSink(String url, Outputter outputter) throws IOException {
    url_ = url;
    outputter_ = outputter;
  }

  @Override
  public void put(FObject obj, Detachable sub) {
    HttpURLConnection conn = null;
    OutputStream os = null;
    BufferedWriter writer = null;

    try {
      conn = (HttpURLConnection) new URL(url_).openConnection();
      conn.setRequestMethod("POST");
      conn.setDoInput(true);
      conn.setDoOutput(true);
      if ( outputter_ instanceof foam.lib.json.Outputter ) {
        conn.addRequestProperty("Accept", "application/json");
        conn.addRequestProperty("Content-Type", "application/json");
      }
      conn.connect();

      os = conn.getOutputStream();
      writer = new BufferedWriter(new OutputStreamWriter(os, StandardCharsets.UTF_8));
      writer.write(outputter_.stringify(obj));
      writer.flush();
      writer.close();
      os.close();

      // check response code
      int code = conn.getResponseCode();
      if ( code != HttpServletResponse.SC_OK ) {
        throw new HttpException();
      }
    } catch (Throwable t) {
      throw new RuntimeException(t);
    } finally {
      IOUtils.closeQuietly(writer);
      IOUtils.closeQuietly(os);
      if ( conn != null ) {
        conn.disconnect();
      }
    }
  }
}