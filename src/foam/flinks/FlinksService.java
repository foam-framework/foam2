/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.flinks;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

import foam.core.ContextAware;
import foam.core.X;
import foam.flinks.model.*;

public class FlinksService 
  implements ContextAware
{
  public static final String REST_GET = "GET";
  public static final String REST_POST = "POST";
  public static final String AUTHORIZE = "Authorize";
  public static final String AUTHORIZE_MULTIPLE = "AuthorizeMultiple";
  public static final String ACCOUNTS_SUMMARY = "GetAccountsSummary";
  public static final String WAIT_SUMMARY = "WaitSummary";
  public static final String ACCOUNTS_DETAIL = "GetAccountsDetail";
  public static final String ACCOUNTS_STATEMENTS = "GetStatements";

  private String address_;
  private X x_;

  public FlinksService() {
    this(null, "8bc4718b-3780-46d0-82fd-b217535229f1");
  }
  public FlinksService(X x, String customerId) {
    this(x, "https://nanopay-api.private.fin.ag/v3", customerId);
  }
  public FlinksService(X x, String url, String customerId) {
    address_ = url + "/" + customerId + "/" + "BankingServices";
    setX(x);
  }

  @Override
  public X getX() {
    return x_;
  }

  @Override 
  public void setX(X x) {
    x_ = x;
  }

  public ResponseMsg service(RequestMsg msg, String RequestInfo) {
    if ( RequestInfo.equals(AUTHORIZE) ) {
      return authorizeService(msg);
    } else if ( RequestInfo.equals(AUTHORIZE_MULTIPLE) ) {
      return null;
    } else if ( RequestInfo.equals(ACCOUNTS_SUMMARY) ) {
      return accountsSummaryService(msg);
    } else if ( RequestInfo.equals(ACCOUNTS_STATEMENTS) ) {
      return null;
    } else if ( RequestInfo.equals(ACCOUNTS_DETAIL) ) {
      return accountsDetailService(msg);
    } else if ( RequestInfo.equals(WAIT_SUMMARY) ) {
      return null;
    } else {
      return null;
    }
  }

  public ResponseMsg authorizeService(RequestMsg msg) {
    ResponseMsg resp = request(msg);

    if ( resp.getHttpStatusCode() == 203 ) {
      //success authorize
      resp.setModelInfo(FlinksMFAResponse.getOwnClassInfo());
    } else if ( resp.getHttpStatusCode() == 200 ) {
      //MFA challenge
      resp.setModelInfo(FlinksAuthResponse.getOwnClassInfo());
    } else {
      //Error response
      resp.setModelInfo(FlinksInvalidResponse.getOwnClassInfo());
    }
    return resp;
  }

  public ResponseMsg accountsDetailService(RequestMsg msg) {
    ResponseMsg resp = request(msg);

    if ( resp.getHttpStatusCode() == 200 ) {
      resp.setModelInfo(FlinksAccountsDetailResponse.getOwnClassInfo());
    } else {
      resp.setModelInfo(FlinksInvalidResponse.getOwnClassInfo());
    }
    return resp;
  }

  public ResponseMsg accountsSummaryService(RequestMsg msg) {
    ResponseMsg resp = request(msg);
    
        if ( resp.getHttpStatusCode() == 200 ) {
          resp.setModelInfo(FlinksAccountsSummaryResponse.getOwnClassInfo());
        } else {
          resp.setModelInfo(FlinksInvalidResponse.getOwnClassInfo());
        }
        return resp;
  }

  private ResponseMsg request(RequestMsg req) {

    HttpURLConnection connection = null;
    OutputStream os = null;
    InputStream is = null;
    StringBuilder res = null;

    try {
      URL url = new URL(address_ + "/" + req.getRequestInfo());
      connection = (HttpURLConnection) url.openConnection();

      //configure HttpURLConnection
      connection.setConnectTimeout(10 * 1000);
      connection.setReadTimeout(10 * 1000);
      connection.setDoOutput(true);
      connection.setUseCaches(false);

      //set request method
      connection.setRequestMethod(req.getHttpMethod());

      //configure http header
      connection.setRequestProperty("Connection", "keep-alive");
      connection.setRequestProperty("Content-Type", "application/json");

      //write to the outputStream only when POST
      if( req.getHttpMethod().equals(REST_POST) ) {
        os = connection.getOutputStream();
        PrintStream printStream = new PrintStream(os, false, "UTF-8");
        printStream.print(req.getJson());
        printStream.flush();
      }

      int httpCode = connection.getResponseCode();
      if ( httpCode / 100 == 2 ) {
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
      //remember to set X
      ResponseMsg msg = new ResponseMsg(getX(), res.toString());
      msg.setHttpStatusCode(httpCode);
      return msg;
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