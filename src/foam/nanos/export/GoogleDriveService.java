package foam.nanos.export;

import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.List;

public class GoogleDriveService extends foam.core.AbstractFObject {
  private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();
  private static final List<String> SCOPES = Collections.singletonList(DriveScopes.DRIVE);
  private static final String CREDENTIALS_FILE = "credentials.json";


  public static void deleteFile(String fileId) throws IOException, GeneralSecurityException {
    final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
    Drive service = new Drive.Builder(HTTP_TRANSPORT, JSON_FACTORY,  GoogleApiAuthService.getCredentials(HTTP_TRANSPORT, SCOPES))
      .setApplicationName("nanopay")
      .build();

    service.files().delete(fileId).execute();

  }
}