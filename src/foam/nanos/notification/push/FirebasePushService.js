/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.push',
  name: 'FirebasePushService',

  implements: [
    'foam.nanos.notification.push.PushService'
  ],

  javaImports: [
    'foam.lib.json.Outputter',
    'foam.lib.json.OutputterMode',
    'java.io.BufferedReader',
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
BufferedReader in = null;

try {
//  if (user == null)
//    throw new RuntimeException("Invalid Parameters: Missing user");
//  if (data == null)
//    throw new RuntimeException("Invalid Parameters: Missing data");
//  if ( message == null || message.isEmpty() )
//    throw new RuntimeException("Invalid Parameter: Missing message");

  URL url = new URL(FIREBASE_URL);
  conn = (HttpURLConnection) url.openConnection();

  conn.setRequestMethod("POST");
  conn.setRequestProperty("Authorization", "key=" + getApiKey());
  conn.setRequestProperty("Content-Type", "application/json");

  Map<String, Object> body = new HashMap<String, Object>();
//      body.put("to", user.getDeviceToken());

  Map<String, Object> notification = new HashMap<String, Object>();
  notification.put("body", msg);
  notification.put("badge", "1");
  notification.put("sound", "default");
  body.put("notification", notification);

  body.put("content_available", true);
  body.put("priority", "high");
  body.put("data", data);

  Outputter outputter = new Outputter(OutputterMode.NETWORK);
  outputter.output(body);
  System.out.println(outputter.toString());

  return true;
} catch (Throwable t) {
  throw new RuntimeException(t);
} finally {
  if ( in != null ) {
    try {
      in.close();
    } catch (Throwable ignored) {}
  }

  if ( conn != null ) {
    conn.disconnect();
  }
}`
    }
  ]
})