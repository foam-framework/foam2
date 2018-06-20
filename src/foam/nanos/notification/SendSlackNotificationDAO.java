package foam.nanos.notification;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;


public class SendSlackNotificationDAO extends ProxyDAO {

    public SendSlackNotificationDAO(DAO delegate) {
      setDelegate(delegate);
    }

    public SendSlackNotificationDAO(X x, DAO delegate) {
      setX(x);
      setDelegate(delegate);
    }
    @Override
    public FObject put_(X x, FObject obj) {
      Notification notif = (Notification) obj;
      Boolean sendSlackMessage = notif.getSendSlackMessage();
      String slackWebhook = notif.getSlackWebhook();
      String slackMessage = notif.getSlackMessage();

      if ( sendSlackMessage ) {
        CloseableHttpClient client = HttpClients.createDefault();
        HttpPost httppost = new HttpPost(slackWebhook);
        httppost.addHeader("Content-type", "application/json");
        StringEntity params = new StringEntity("{\"text\" : \"" + slackMessage + "\"}", "UTF-8");
        params.setContentType("application/json");
        httppost.setEntity(params);
        try {
            CloseableHttpResponse response =  client.execute(httppost);
            // TO REVIEWER - Is there a better way to handle non 200 responses from slack?
            if (response.getStatusLine().getStatusCode() != 200 ){
              System.err.print("Could not post to Slack; error code -" + response.getStatusLine().getStatusCode() + "\n1");
            };
        } catch (Throwable t) {
          System.err.print(t);
        }
      }
      return super.put_(x, obj);
    }
}
