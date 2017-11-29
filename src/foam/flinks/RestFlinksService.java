/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.flinks;

import foam.core.FObject;
import foam.lib.json.Outputter;

import java.net.URL;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintStream;
import java.io.IOException;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;

public class RestFlinksService {
  public static String REST_GET = "GET";
  public static String REST_POST = "POST";
  public static String AUTHORIZE = "Authorize";
  public static String AUTHORIZE_MULTIPLE = "AuthorizeMultiple";
  public static String GET_ACCOUNTS_SUMMARY = "GetAccountsSummary";
  public static String WAIT_SUMMARY = "WaitSummary";
  public static String GET_ACCOUNTS_DETAIL = "GetAccountsDetail";
  public static String GET_STATEMENTS = "GetStatements";
  public static String TEST_AUTHORIZE = "{\"class\" : \"adsfadfads\",\"Institution\": \"FlinksCapital\",\"Username\": \"Greatday\",\"Password\": \"Everyday\",\"Save\":true,\"MostRecentCached\":false}";

  private String address_ = "https://nanopay-api.private.fin.ag/v3/8bc4718b-3780-46d0-82fd-b217535229f1/BankingServices";

  public FObject authorize(FObject request) {
    String url = address_ + "/" + AUTHORIZE;
    String responseJSON = postRequest(url, request);
    System.out.println(responseJSON);
    return null;
  }

  public FObject authorizedMultiple(FObject request) {
    return null;
  }

  public FObject getAccountsSummary(FObject request) {
    return null;
  }

  public FObject waitSummary(FObject request) {
    return null;
  }

  public FObject getAccountsDetail(FObject request) {
    return null;
  }

  public FObject getStatements(FObject request) {
    return null;
  }

  private String postRequest(String address, FObject request) {
    // if ( request == null ) {
    //   return null;
    // }

    HttpURLConnection connection = null;
    OutputStream os = null;
    InputStream is = null;
    Outputter outputter = new Outputter();

    try {
      URL url = new URL(address);
      connection = (HttpURLConnection) url.openConnection();

      //configure HttpURLConnection
      connection.setConnectTimeout(5 * 1000);
      connection.setReadTimeout(5 * 1000);
      connection.setDoOutput(true);
      connection.setUseCaches(false);

      //set request method
      connection.setRequestMethod(REST_POST);

      //configure http header
      connection.setRequestProperty("Connection", "keep-alive");
      connection.setRequestProperty("Content-Type", "application/json");

      os = connection.getOutputStream();
      PrintStream printStream = new PrintStream(os, false, "UTF-8");
      printStream.print(outputter.stringify(request));
      printStream.flush();


      is = connection.getInputStream();
      BufferedReader  reader = new BufferedReader(new InputStreamReader(is, "UTF-8"));
      String json = "";
      String line = null;
      while ( (line = reader.readLine()) != null ) {
        json += line;
      }
      return json;
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
}