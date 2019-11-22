package foam.nanos.test.api;

import foam.core.X;
import foam.util.SafetyUtil;

import java.net.HttpURLConnection;

// API Authentication failure tests.
public class AuthenticationFailureApiTest extends ApiTestBase { 
  
  // Create the transaction summary report
  public void runTest(X x) {
    try 
    {
      // Create the request
      String digUrl = this.getBaseUrl(x) + "/service/dig";
      HttpURLConnection connection = this.createRequest(digUrl, "GET", "developer@nanopay.net", "Inc0rrectP@ssword");
      
      // Execute the call
      int responseCode = connection.getResponseCode();
      test(401 == responseCode, "[" + digUrl + "] Response status should be 401 - actual: " + responseCode);
    }
    catch (Exception ex)
    {
      test(false, "Exception in test case: " + ex.getMessage());
      print(ex.toString());
    }
  }
}
