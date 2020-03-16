/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
 
package foam.nanos.export;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Arrays;
import java.util.List;

public class GoogleApiAuthService extends foam.core.AbstractFObject {
  private static final String CREDENTIALS_FOLDER = "/tmp";
  private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();


  public Credential getCredentials(NetHttpTransport HTTP_TRANSPORT, List<String> scopes) throws IOException {

    GoogleApiCredentials credentialsConfig = (GoogleApiCredentials)getX().get("googleApiCredentialsConfig");
    GoogleClientSecrets.Details details = new GoogleClientSecrets.Details()
            .setClientId(credentialsConfig.getClient_id())
            .setClientSecret(credentialsConfig.getClient_secret())
            .setAuthUri(credentialsConfig.getAuth_uri())
            .setTokenUri(credentialsConfig.getToken_uri())
            .setRedirectUris(Arrays.asList(credentialsConfig.getRedirect_uris()));

    GoogleClientSecrets clientSecrets = new GoogleClientSecrets().setInstalled(details);
    GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
              HTTP_TRANSPORT, JSON_FACTORY, clientSecrets, scopes)
              .setDataStoreFactory(new FileDataStoreFactory(new java.io.File(CREDENTIALS_FOLDER + "/tokens/")))
              .build();
    
    LocalServerReceiver receiver = new LocalServerReceiver.Builder().setPort(credentialsConfig.getPort()).build();
    return new AuthorizationCodeInstalledApp(flow, receiver).authorize("user");
  }
}
