/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.blob;

import foam.core.X;
import foam.lib.json.JSONParser;

import java.net.URL;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.InputStreamReader;

public class RestBlobService
    extends AbstractBlobService
{
  public static final int BUFFER_SIZE = 8192;

  protected String address_;

  public RestBlobService(String address) {
    this(null, address);
  }

  public RestBlobService(foam.core.X x, String address) {
    setX(x);
    this.address_ = address + "/httpBlobService";
  }

  public String getAddress() {
    return address_;
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
      URL url = new URL(address_);
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

      //output blob into connection
      long chunk = 0;
      long size = blob.getSize();
      long chunks = (long) Math.ceil((double) size / (double) BUFFER_SIZE);
      Buffer buffer = new Buffer(BUFFER_SIZE, ByteBuffer.allocate(BUFFER_SIZE));
      os = connection.getOutputStream();

      while ( chunk < chunks ) {
        buffer = blob.read(buffer, chunkOffset(chunk));
        byte[] buf = buffer.getData().array();
        os.write(buf, 0, (int) buffer.getLength());
        buffer.getData().clear();
        chunk++;
      }

      os.flush();

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
      throw new RuntimeException(t);
    } finally {
      closeSource(is, os, connection);
    }
  }

  @Override
  public Blob find_(X x, Object id) {
    InputStream is = null;
    HttpURLConnection connection = null;
    Blob blob = null;

    try {
      URL url = new URL(this.address_ + "/" + id.toString());
      connection = (HttpURLConnection) url.openConnection();

      connection.setRequestMethod("GET");
      connection.connect();

      if ( connection.getResponseCode() != HttpURLConnection.HTTP_OK ||
          connection.getContentLengthLong() == -1 ) {
        throw new RuntimeException("Failed to find blob");
      }

      is = connection.getInputStream();
      blob = new InputStreamBlob(is, connection.getContentLengthLong());
    } catch ( Throwable t ) {
      throw new RuntimeException(t);
    } finally {
      closeSource(is, null, connection);
      return blob;
    }
  }

  @Override
  public String urlFor_(X x, Blob blob) {
    if ( ! (blob instanceof IdentifiedBlob) ) {
      return null;
    }
    return this.address_ + "/" + ((IdentifiedBlob) blob).getId();
  }

  private long chunkOffset(long i) {
    return i * BUFFER_SIZE;
  }

  private void closeSource(InputStream is, OutputStream os, HttpURLConnection connection) {
    if ( os != null ) {
      try {
        os.close();
      } catch ( IOException e ) {
        e.printStackTrace();
      }
    }
    if ( is != null ) {
      try {
        is.close();
      } catch ( IOException e ) {
        e.printStackTrace();
      }
    }
    if ( connection != null ) {
      connection.disconnect();
    }
  }
}