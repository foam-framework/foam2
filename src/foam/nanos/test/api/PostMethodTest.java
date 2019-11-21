package foam.nanos.test.api;

import static foam.mlang.MLang.EQ;

import java.io.OutputStream;
import java.net.HttpURLConnection;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;

public class PostMethodTest
  extends ApiTestBase {

  public static final String TEST_USER_EMAIL_ADDRESS = "admin@nanopay.net";

  public void runTest(X x) {

    try {
      // Enable the test user.
      DAO  localUserDAO = ( (DAO) x.get("localUserDAO") ).inX(x);
      User user         = (User) ( localUserDAO.find(EQ(User.EMAIL, "admin@nanopay.net")) ).fclone();
      user.setLoginEnabled(true);
      localUserDAO.put(user);

      // Create the request
      String            sugarUrl   = this.getBaseUrl(x) + "/service/sugar";
      HttpURLConnection connection = this.createRequest(sugarUrl, "POST", TEST_USER_EMAIL_ADDRESS, "adminAb1");
      connection.setRequestProperty("Content-Type", "application/json");
      
      String st = "{\n" + 
          "    \"service\": \"auth\",\n" + 
          "    \"interfaceName\": \"foam.nanos.auth.AuthService\",\n" + 
          "    \"method\": \"checkUser\",\n" + 
          "    \"X\": \"X\",\n" + 
          "    \"permission\":\"menu.read.doc\",\n" + 
          "    \"user\":"+ user.toJSON() +
          "}";
      
      connection.setDoOutput(true);
      OutputStream os = connection.getOutputStream();
      os.write(st.getBytes());
      os.flush();
      os.close();

      // Execute the call
      int responseCode = connection.getResponseCode();

      test(200 == responseCode, "[" + sugarUrl + "] Response status should be 200 - actual: " + responseCode);
      if ( 200 != responseCode ) return;

      // Show response data
      String s = this.getResponseData(connection);

      // TODO the response have whitespace that need to be deleted.
      // to convert it to appropriate type.
      // boolean response = Boolean.valueOf(s);
      test(s.contains("true"), "the same user can act as it self");
    } catch (Exception ex) {
      print(ex.toString());
    }
  }
}
