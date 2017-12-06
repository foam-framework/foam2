/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.flinks;

import java.net.URL;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintStream;
import java.io.IOException;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;

public class RestCall {
  public static final String REST_GET = "GET";
  public static final String REST_POST = "POST";

  public RestCall() {}

  private String request(String address, String method, String json) {

    HttpURLConnection connection = null;
    OutputStream os = null;
    InputStream is = null;
    StringBuilder res = null;

    try {
      URL url = new URL(address);
      connection = (HttpURLConnection) url.openConnection();

      //configure HttpURLConnection
      connection.setConnectTimeout(5 * 1000);
      connection.setReadTimeout(5 * 1000);
      connection.setDoOutput(true);
      connection.setUseCaches(false);

      //set request method
      connection.setRequestMethod(method);

      //configure http header
      connection.setRequestProperty("Connection", "keep-alive");
      connection.setRequestProperty("Content-Type", "application/json");

      //write to the outputStream only when POST
      if( method.equals(REST_POST) ) {
        os = connection.getOutputStream();
        PrintStream printStream = new PrintStream(os, false, "UTF-8");
        printStream.print(json);
        printStream.flush();
      }

      System.out.println("Flinks response code: " + connection.getResponseCode());
      if ( connection.getResponseCode() / 100 == 2 ) {
        is = connection.getInputStream();
      } else {
        is = connection.getErrorStream();
      }

      BufferedReader  reader = new BufferedReader(new InputStreamReader(is, "UTF-8"));
      res = builders.get();
      String line = null;
      while ( (line = reader.readLine()) != null ) {
        res.append(line);
      }
      return res.toString();
    } catch ( Throwable t ) {
      throw new RuntimeException(t);
    } finally {
      closeSource(is, os, connection);
    }
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

  protected ThreadLocal<StringBuilder> builders = new ThreadLocal<StringBuilder>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }
    @Override
    public StringBuilder get() {
      StringBuilder sb = super.get();
      sb.setLength(0);
      return sb;
    }
  };
}