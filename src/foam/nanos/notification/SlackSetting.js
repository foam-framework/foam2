
/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'SlackSetting',
  extends: 'foam.nanos.notification.NotificationSetting',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.nanos.logger.Logger',
    'org.apache.http.client.methods.CloseableHttpResponse',
    'org.apache.http.client.methods.HttpPost',
    'org.apache.http.entity.StringEntity',
    'org.apache.http.impl.client.CloseableHttpClient',
    'org.apache.http.impl.client.HttpClients'
  ],

  methods: [
    {
      name: 'sendNotification',
      javaCode: `
        Logger logger = (Logger) x.get("logger");

        if ( foam.util.SafetyUtil.isEmpty(notification.getSlackWebhook()) )
          return;

        // Get the message to send
        String slackMessage = notification.getSlackMessage();
        if ( foam.util.SafetyUtil.isEmpty(slackMessage) ) {
          slackMessage = notification.getBody();
        }

        // Post to the slack webhook
        HttpPost httpPost = new HttpPost(notification.getSlackWebhook());
        httpPost.addHeader("Content-type", "application/json");
        
        // Add the slack message to the post
        StringEntity params = new StringEntity("{\\"text\\" : \\"" + slackMessage + "\\"}", "UTF-8");
        params.setContentType("application/json");
        httpPost.setEntity(params);
        
        try {
          CloseableHttpResponse response =  HttpClients.createDefault().execute(httpPost);
            
          if ( response.getStatusLine().getStatusCode() != 200 )
            logger.warning("Could not post to Slack; error code - " + response.getStatusLine().getStatusCode());
        } catch (Throwable t) {
          logger.error("Error sending slack message: ", t);
        }
      `
    }
  ]
});
