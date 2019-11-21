package foam.nanos.test.api;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;

import static foam.mlang.MLang.EQ;

import java.net.HttpURLConnection;


// API Authentication tests.
public class AuthenticationApiTest extends ApiTestBase { 

  public static final String TEST_USER_EMAIL_ADDRESS = "developer@nanopay.net";
  
  // Create the transaction summary report
  public void runTest(X x) {

    try 
    {
      // Enable the test user.
      DAO localUserDAO = ((DAO) x.get("localUserDAO")).inX(x);
      User user = (User) (localUserDAO.find(EQ(User.EMAIL, TEST_USER_EMAIL_ADDRESS))).fclone();
      user.setLoginEnabled(true);
      localUserDAO.put(user);

      // Create the request
      String digUrl = this.getBaseUrl(x) + "/service/dig";
      HttpURLConnection connection = this.createRequest(digUrl);
      
      // Execute the call
      int responseCode = connection.getResponseCode();
      test(200 == responseCode, "[" + digUrl + "] Response status should be 200 - actual: " + responseCode);
      if (200 != responseCode)
        return;
      
      // Show response data
      String response = this.getResponseData(connection);
      print("Response: " + response);

      // Print the headers
      String sessionCookie = this.getSessionId(connection, true);
      test(!SafetyUtil.isEmpty(sessionCookie), "Session cookie should be set. SessionId: " + sessionCookie);
      
      // Attempt to send a request with the session ID
      connection = this.createRequest(digUrl, "GET", sessionCookie);
      
      // Check the response code
      responseCode = connection.getResponseCode();
      test(200 == responseCode, "Response status when using session ID should be 200 - actual: " + responseCode);

      // Ensure the response data is empty
      String responseData = this.getResponseData(connection);
      test(SafetyUtil.isEmpty(responseData), "Response data should be empty, not a redirect to the login screen: (" + responseData + ")");

      // Disable the test user.
      user.setLoginEnabled(false);
      localUserDAO.put(user);
    }
    catch (Exception ex)
    {
      print(ex.toString());
    }
  }
}
