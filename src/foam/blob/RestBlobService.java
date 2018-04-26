/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.blob;

import foam.core.X;
import foam.lib.json.JSONParser;
import foam.util.SafetyUtil;
import org.apache.commons.io.IOUtils;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.CharBuffer;

public class RestBlobService
    extends AbstractBlobService
{
  protected static final int BUFFER_SIZE = 8192;
  protected static final ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder b = super.get();
      b.setLength(0);
      return b;
    }
  };

  protected String address_;
  protected String sessionId_;

  public RestBlobService(X x, String address) {
    this(x, address, null);
  }

  public RestBlobService(X x, String address, String sessionId) {
    setX(x);
    address_ = address;
    sessionId_ = sessionId;
  }

  public void setSessionId(String sessionId) {
    sessionId_ = sessionId;
  }

  @Override
  public Blob put_(X x, Blob blob) {
    if ( blob instanceof IdentifiedBlob ) {
      return blob;
    }

    HttpURLConnection connection = null;
    OutputStream os = null;
    InputStream is = null;

    try {
      StringBuilder builder = sb.get().append(address_);
      if ( ! SafetyUtil.isEmpty(sessionId_) ) {
        builder.append("?sessionId=").append(sessionId_);
      }

      URL url = new URL(builder.toString());
      connection = (HttpURLConnection) url.openConnection();

      //configure HttpURLConnection
      connection.setConnectTimeout(5 * 1000);
      connection.setReadTimeout(5 * 1000);
      connection.setDoOutput(true);
      connection.setUseCaches(false);

      //set request method
      connection.setRequestMethod("PUT");

      //configure http header
      connection.setRequestProperty("Accept", "*/*");
      connection.setRequestProperty("Connection", "keep-alive");
      connection.setRequestProperty("Content-Type", "application/octet-stream");

      // get connection ouput stream
      os = connection.getOutputStream();

      //output blob into connection
      blob.read(os, 0, blob.getSize());

      if ( connection.getResponseCode() != HttpURLConnection.HTTP_OK ) {
        throw new RuntimeException("Upload failed");
      }

      is = connection.getInputStream();
      BufferedReader  reader = new BufferedReader(new InputStreamReader(is, "UTF-8"));
      CharBuffer cb = CharBuffer.allocate(65535);
      reader.read(cb);
      cb.rewind();

      return (Blob) getX().create(JSONParser.class).parseString(cb.toString(), IdentifiedBlob.class);
    } catch ( Throwable t ) {
      t.printStackTrace();
      throw new RuntimeException(t);
    } finally {
      IOUtils.closeQuietly(is);
      IOUtils.closeQuietly(os);
      IOUtils.close(connection);
    }
  }

  @Override
  public Blob find_(X x, Object id) {
    InputStream is = null;
    ByteArrayOutputStream os = null;
    HttpURLConnection connection = null;

    try {
      StringBuilder builder = sb.get().append(address_)
          .append("/").append(id.toString());
      if ( ! SafetyUtil.isEmpty(sessionId_) ) {
        builder.append("?sessionId=").append(sessionId_);
      }

      URL url = new URL(builder.toString());
      connection = (HttpURLConnection) url.openConnection();

      connection.setRequestMethod("GET");
      connection.connect();

      if ( connection.getResponseCode() != HttpURLConnection.HTTP_OK ||
          connection.getContentLength() == -1 ) {
        throw new RuntimeException("Failed to find blob");
      }

      is = new BufferedInputStream(connection.getInputStream());
      os = new ByteArrayOutputStream();

      int read = 0;
      byte[] buffer = new byte[BUFFER_SIZE];
      while ( (read = is.read(buffer, 0, BUFFER_SIZE)) != -1 ) {
        os.write(buffer, 0, read);
      }

      return new ByteArrayBlob(os.toByteArray());
    } catch ( Throwable t ) {
      throw new RuntimeException(t);
    } finally {
      IOUtils.closeQuietly(os);
      IOUtils.closeQuietly(is);
      IOUtils.close(connection);
    }
  }

  @Override
  public String urlFor_(X x, Blob blob) {
    if ( ! (blob instanceof IdentifiedBlob) ) {
      return null;
    }

    StringBuilder builder = sb.get().append(address_)
        .append("/").append(((IdentifiedBlob) blob).getId());
    if ( ! SafetyUtil.isEmpty(sessionId_) ) {
      builder.append("?sessionId=").append(sessionId_);
    }
    return builder.toString();
  }
}