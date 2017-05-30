package com.chrome.origintrials.services.impl;

import com.chrome.origintrials.model.*;

import com.chrome.origintrials.services.TokenService;
import com.google.appengine.api.mail.*;

import foam.lib.json.*;

import java.io.*;
import java.net.*;

public class AppengineTokenServiceImpl extends foam.core.ContextAwareSupport implements TokenService {
  public void generateAndEmailToken(Application app) {
    try {
      URL url = new URL("https://proxy-dot-astute-harmony-144016.googleplex.com/api");
      HttpURLConnection conn = (HttpURLConnection)url.openConnection();
      conn.setRequestMethod("POST");

      // Turning off follow redirects will cause appengine to set the
      // X-Appengine-Fetch-Inbound-Appid automatically.
      conn.setInstanceFollowRedirects(false);

      conn.setRequestProperty("Accept", "application/json");
      conn.setRequestProperty("Content-Type", "application/json");
      conn.setDoInput(true);
      conn.setDoOutput(true);

      CreateTokenRequest req = getX().create(CreateTokenRequest.class);

      req.setOrigin(app.getOrigin());
      req.setFeature((String)app.getExperiment());

      String payload = "{\"origin\":\"http://localhost:8888\",\"feature\":\"bluetooth\"}";

      OutputStream output = conn.getOutputStream();
      output.write(payload.getBytes("UTF-8"));

      BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));

      StringBuilder builder = new StringBuilder();
      while ( true ) {
        String line = reader.readLine();
        if ( line == null ) break;

        builder.append(line);
        builder.append("\n");
      }

      String response = builder.toString();

      CreateTokenResponse resp = (CreateTokenResponse)(getX().create(JSONParser.class).parseString(response, CreateTokenResponse.class));

      MailServiceFactory.getMailService().send(
                                               new MailService.Message("adamvy@google.com", "adamvy@google.com", "New token generated.",
                                                                       "Token generated/\n" + new foam.lib.json.Outputter().stringify(resp)));
    } catch(Exception e) {
      throw new RuntimeException(e);
    }
  }
}
