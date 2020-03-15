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
import java.io.InputStreamReader;
import java.util.List;

public class GoogleApiAuthService {
  private static final String CREDENTIALS_FOLDER = "NANOPAY_HOME";
  private static final String CREDENTIALS_FILE = "credentials.json";
  private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();
  private static final int RANDOM_PORT = 64342;


  public static Credential getCredentials(NetHttpTransport HTTP_TRANSPORT, List<String> scopes) {
    GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(JSON_FACTORY, new InputStreamReader(new FileInputStream(System.getProperty(CREDENTIALS_FOLDER) + "/" + CREDENTIALS_FILE)));
    GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
              HTTP_TRANSPORT, JSON_FACTORY, clientSecrets, scopes)
              .setDataStoreFactory(new FileDataStoreFactory(new java.io.File(System.getProperty(CREDENTIALS_FOLDER))))
              .build();
    
    LocalServerReceiver receiver = new LocalServerReceiver.Builder().setPort(RANDOM_PORT).build();
    return new AuthorizationCodeInstalledApp(flow, receiver).authorize("user");
  }
}
