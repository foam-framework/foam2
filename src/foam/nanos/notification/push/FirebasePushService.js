/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/* refinement to add device token property for Firebase */
foam.CLASS({
  refines: 'foam.nanos.auth.User',

  properties: [
    {
      class: 'String',
      name: 'deviceToken'
    }
  ]
});

foam.CLASS({
  package: 'foam.nanos.notification.push',
  name: 'FirebasePushService',

  implements: [
    'foam.nanos.notification.push.PushService'
  ],

  javaImports: [
    'foam.lib.json.Outputter',
    'foam.lib.json.OutputterMode',
    'foam.util.SafetyUtil',
    'java.io.OutputStreamWriter',
    'java.net.HttpURLConnection',
    'java.net.URL',
    'java.util.HashMap',
    'java.util.Map'
  ],

  constants: [
    {
      name: 'FIREBASE_URL',
      value: 'https://fcm.googleapis.com/fcm/send',
      type: 'String'
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'apiKey'
    }
  ],

  methods: [
    {
      name: 'sendPush',
      javaCode:
`HttpURLConnection conn = null;
OutputStreamWriter wr = null;

try {
  if ( user == null || SafetyUtil.isEmpty(user.getDeviceToken()) )
    throw new RuntimeException("Invalid Parameters: Missing user");
  if ( msg == null || msg.isEmpty() )
    throw new RuntimeException("Invalid Parameter: Missing message");

  URL url = new URL(FIREBASE_URL);
  conn = (HttpURLConnection) url.openConnection();

  conn.setRequestMethod("POST");
  conn.setRequestProperty("Authorization", "key=" + getApiKey());
  conn.setRequestProperty("Content-Type", "application/json");

  Map<String, Object> body = new HashMap<String, Object>();
  body.put("to", user.getDeviceToken());

  Map<String, Object> notification = new HashMap<String, Object>();
  notification.put("body", msg);
  notification.put("badge", "1");
  notification.put("sound", "default");
  body.put("notification", notification);

  body.put("content_available", true);
  body.put("priority", "high");
  if ( data != null ) {
    body.put("data", data);
  }

  Outputter outputter = new Outputter(OutputterMode.NETWORK);
  outputter.output(body);

  wr = new OutputStreamWriter(conn.getOutputStream());
  wr.write(outputter.toString());
  wr.flush();

  return ( conn.getResponseCode() == 200 );
} catch (Throwable t) {
  throw new RuntimeException(t);
} finally {
  if ( wr != null )
    try { wr.close(); } catch (Throwable ignored) {}
  if ( conn != null )
    conn.disconnect();
}`
    }
  ]
});
