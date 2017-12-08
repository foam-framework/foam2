/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.flinks;

import foam.core.FObject;
import foam.lib.json.Outputter;

import java.net.URL;

import javax.management.RuntimeErrorException;

import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintStream;
import java.io.IOException;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;

public class RestFlinksService {
  public static final String REST_GET = "GET";
  public static final String REST_POST = "POST";
  public static final String AUTHORIZE = "Authorize";
  public static final String AUTHORIZE_MULTIPLE = "AuthorizeMultiple";
  public static final String ACCOUNTS_SUMMARY = "GetAccountsSummary";
  public static final String WAIT_SUMMARY = "WaitSummary";
  public static final String ACCOUNTS_DETAIL = "GetAccountsDetail";
  public static final String ACCOUNTS_STATEMENTS = "GetStatements";
  public static final Outputter outputter = new Outputter();

  private String address_;
  private String customerId_;
  private String url_;

  public RestFlinksService() {
    this("8bc4718b-3780-46d0-82fd-b217535229f1");
  }

  public RestFlinksService(String customerId) {
    this("https://nanopay-api.private.fin.ag/v3", customerId);
  }

  public RestFlinksService(String address, String customerId) {
    address_ = address;
    customerId_ = customerId;
    url_ = address_ + "/" + customerId_ + "/" + "BankingServices";
  }

  public String authorize(FObject request) {
    String address = url_ + "/" + AUTHORIZE;
    String responseJSON = request(address, REST_POST, outputter.stringify(request));
    return responseJSON;
  }

  public String getAccountsDetail(FObject request) {
    String address = url_ + "/" + ACCOUNTS_DETAIL;
    String responseJSON = request(address, REST_POST, outputter.stringify(request));
    return responseJSON;
  }

  public FObject getStatements(FObject request) {
    return null;
  }

  private String request(String address, String method, String json) {

    HttpURLConnection connection = null;
    OutputStream os = null;
    InputStream is = null;
    StringBuilder res = null;

    try {
      URL url = new URL(address);
      connection = (HttpURLConnection) url.openConnection();

      //configure HttpURLConnection
      connection.setConnectTimeout(10 * 1000);
      connection.setReadTimeout(10 * 1000);
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
      System.out.println("This is error");
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