/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.blob;

import foam.core.X;

import java.net.URL;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.nio.ByteBuffer;
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
    IdentifiedBlob result = null;
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

      if ( connection.getResponseCode() == HttpURLConnection.HTTP_OK ) {
        is = connection.getInputStream();
        BufferedReader reader = new BufferedReader(new InputStreamReader(is));
        String json = "";
        String line = null;
        while ( (line = reader.readLine()) != null ) {
          json += line;
        }

        result = (IdentifiedBlob) (new foam.lib.json.JSONParser()).parseString(json, IdentifiedBlob.class);
        result.setX(getX());
      } else {
        throw new RuntimeException("upload fail");
      }
    } catch ( MalformedURLException e ) {
      throw new RuntimeException(e);
    } catch ( IOException e ) {
      throw new RuntimeException(e);
    } finally {
      closeSource(is, os, connection);
      return result;
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

      if ( connection.getResponseCode() == HttpURLConnection.HTTP_OK ) {
        is = connection.getInputStream();
        blob = new InputStreamBlob(is);
      } else {
        throw new RuntimeException("download fail");
      }
    } catch ( MalformedURLException e ) {
      throw new RuntimeException(e);
    } catch ( IOException e ) {
      throw new RuntimeException(e);
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