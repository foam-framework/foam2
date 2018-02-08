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

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

public class HTTPSink
    extends AbstractSink
    implements Closeable
{
  protected Writer writer_ = null;
  protected HttpURLConnection conn_;
  protected boolean connected_ = false;
  protected Outputter outputter_;

  public HTTPSink(String url, Outputter outputter) throws IOException {
    conn_ = (HttpURLConnection) new URL(url).openConnection();
    conn_.setConnectTimeout(5 * 1000);
    conn_.setReadTimeout(5 * 1000);
    conn_.setRequestMethod("PUT");
    outputter_ = outputter;
  }

  @Override
  public void put(FObject obj, Detachable sub) {
    try {
      // connect if not connected
      if ( ! connected_) {
        conn_.connect();
        connected_ = true;
      }

      // create new writer if null
      if ( writer_ == null ) {
        writer_ = new BufferedWriter(
            new OutputStreamWriter(conn_.getOutputStream()));
      }

      writer_.write(outputter_.stringify(obj));
      super.put(obj, sub);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  @Override
  public void eof() {
    this.close();
    super.eof();
  }

  @Override
  public void close() {
    IOUtils.closeQuietly(writer_);
    writer_ = null;
    conn_.disconnect();
    connected_ = false;
  }
}