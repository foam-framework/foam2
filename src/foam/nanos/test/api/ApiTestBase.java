package foam.nanos.test.api;

import foam.core.X;
import foam.nanos.app.AppConfig;
import foam.nanos.test.Test;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.ProtocolException;
import java.net.URL;
import java.util.Base64;
import java.util.List;
import java.util.Map;

// API Authentication tests.
public class ApiTestBase extends Test { 
  
  protected String getBaseUrl(X x)
  {
    AppConfig appConfig = (AppConfig) x.get("appConfig");
    String url = appConfig.getUrl();
    return url == null ? null :
           url.endsWith("/") ? url.substring(0, url.length() - 1) :
           url;
  }

  protected HttpURLConnection createRequest(String digUrl)
    throws MalformedURLException, IOException, ProtocolException, UnsupportedEncodingException
  {
    return this.createRequest(digUrl, "GET");
  }

  protected HttpURLConnection createRequest(String digUrl, String method)
  throws MalformedURLException, IOException, ProtocolException, UnsupportedEncodingException
  {
    return this.createRequest(digUrl, method, "developer@nanopay.net", "Nanopay123");
  }

  protected HttpURLConnection createRequest(String digUrl, String method, String user, String password) 
    throws MalformedURLException, IOException, ProtocolException, UnsupportedEncodingException
  {
    // Output
    print("Creating login request for URL: " + digUrl);

    // Create the URL
    URL url = new URL(digUrl);

    // Create the connection
    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
    connection.setRequestMethod(method);
    connection.setRequestProperty("Accept", "application/json");
      
    // Set the auth header
    String encoding = Base64.getEncoder().encodeToString((user + ":" + password).getBytes("UTF-8"));
    connection.setRequestProperty("Authorization", "Basic " + encoding);

    // Return the connection
    return connection;
  }

  protected HttpURLConnection createRequest(String digUrl, String method, String sessionId)
    throws MalformedURLException, IOException, ProtocolException, UnsupportedEncodingException
  {
    // Output
    print("Creating session request for URL: " + digUrl);

    // Create the URL
    URL url = new URL(digUrl);

    // Create the connection
    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
    connection.setUseCaches(false);
    connection.setRequestMethod(method);
    connection.setRequestProperty("Accept", "application/json");
    connection.setRequestProperty("Cookie", "sessionId=" + sessionId);
    
    // Return the connection
    return connection;
  }

  protected String getResponseData(HttpURLConnection connection)
    throws UnsupportedEncodingException, IOException
  {
    Reader in = new BufferedReader(new InputStreamReader(connection.getInputStream(), "UTF-8"));
    StringBuilder stringBuilder = new StringBuilder();
    for (int c; (c = in.read()) >= 0;)
      stringBuilder.append((char)c);
    return stringBuilder.toString();
  }

  protected String getSessionId(HttpURLConnection connection, boolean printHeaders)
  {
    String sessionCookie = null;
    Map<String, List<String>> map = connection.getHeaderFields();
    for (Map.Entry<String, List<String>> entry : map.entrySet())
    {
      for (String s : entry.getValue())
      {
        if (printHeaders)
          print("Key: " + entry.getKey() + " -> " + s);

        // Take the latest session cookie
        if ("Set-Cookie".equalsIgnoreCase(entry.getKey()) &&
            s != null && (s.indexOf("sessionId=") == 0))
          sessionCookie = s.substring("sessionId=".length());
      }
    }

    // Return the session cookie
    return sessionCookie;
  }
}
