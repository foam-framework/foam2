foam.CLASS({
  package: 'foam.nanos.docusign',
  name: 'DocuSignAPIHelper',

  javaImports: [
    'com.google.common.collect.Lists',
    'foam.lib.json.JSONParser',
    'foam.nanos.docusign.DocuSignAccessTokens',
    'foam.nanos.docusign.DocuSignException',
    'foam.nanos.logger.Logger',
    'org.apache.http.client.utils.URLEncodedUtils',
    'org.apache.http.NameValuePair',
    'org.apache.http.message.BasicNameValuePair',
    'java.io.BufferedReader',
    'java.io.BufferedWriter',
    'java.io.IOException',
    'java.io.InputStreamReader',
    'java.io.OutputStreamWriter',
    'java.net.HttpURLConnection',
    'java.net.MalformedURLException',
    'java.net.ProtocolException',
    'java.net.URL',
    'java.nio.charset.StandardCharsets',
    'java.util.List',
  ],

  properties: [
    {
      name: 'docuSignConfig',
      class: 'FObjectProperty',
      of: 'foam.nanos.docusign.DocuSignConfig'
    }
  ],

  methods: [
    {
      name: 'post_',
      documentation: `
        Performs a post, converts programmer error exceptions to runtime exceptions,
        and throws IOException.
      `,
      javaThrows: ['java.io.IOException'],
      args: [
        { name: 'urlStr', type: 'String' },
        { name: 'auth', type: 'String' },
      ],
      javaType: 'HttpURLConnection',
      javaCode: `
        HttpURLConnection conn = null;
        try {
          URL url = new URL(urlStr);
          conn = (HttpURLConnection) url.openConnection();
          conn.setRequestMethod("POST");
          conn.setDoInput(true);
          conn.setDoOutput(true);
          conn.setRequestProperty("Authorization", auth);
        } catch ( MalformedURLException e ) {
          throw new RuntimeException(
            "malformed url: " + e.getMessage());
        } catch ( ProtocolException e ) {
          // This will never happen
          throw new RuntimeException(
            "invalid protocol: " + e.getMessage());
        } catch ( IOException e ) {
          throw e;
        }

        return conn;
      `
    },
    {
      name: 'writeURLEncodedForm_',
      args: [
        { name: 'conn', javaType: 'HttpURLConnection' },
        { name: 'params', javaType: 'List<NameValuePair>' }
      ],
      javaThrows: ['IOException'],
      javaCode: `
        try (
          BufferedWriter w = new BufferedWriter(new OutputStreamWriter(
            conn.getOutputStream(), StandardCharsets.UTF_8))
        ) {
          w.write(URLEncodedUtils.format(params, StandardCharsets.UTF_8));
          w.flush();
        }
      `
    },
    {
      name: 'stringifyResponse_',
      args: [
        { name: 'conn', javaType: 'HttpURLConnection' },
      ],
      javaThrows: ['IOException'],
      type: 'String',
      javaCode: `
        String line = null;
        int code = conn.getResponseCode();
        StringBuilder builder = new StringBuilder();

        try (
          BufferedReader reader = new BufferedReader(new InputStreamReader(
            code >= 200 && code < 300 ? conn.getInputStream() : conn.getErrorStream()
          ))
        ) {
          while ( (line = reader.readLine()) != null ) {
            builder.append(line);
          }
        }

        return builder.toString();
      `
    },
    {
      name: 'getAccessTokens',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'authCode',
          type: 'String'
        }
        // {
        //   name: 'accessTokens',
        //   type: 'foam.nanos.docusign.DocuSignAccessTokens'
        // }
      ],
      javaThrows: ['IOException', 'DocuSignException'],
      javaType: 'foam.nanos.docusign.DocuSignAccessTokens',
      javaCode: `
        Logger logger = (Logger) x.get("logger");

        // Set parameters
        List<NameValuePair> params = Lists.newArrayList();
        params.add(new BasicNameValuePair("grant_type",
          "authorization_code"));
        params.add(new BasicNameValuePair("code",
          authCode));

        // Send request to DocuSign
        HttpURLConnection conn = null;
        DocuSignAccessTokens accessTokens = null;

        try {
          conn = post_(
            getDocuSignConfig().getOAuthBaseURI() + "/token",
            "Basic "+getDocuSignConfig().getAuthorizationHeaderValue()
          );
          writeURLEncodedForm_(conn, params);
          String response = stringifyResponse_(conn);

System.out.println("\\033[32;1m==== RESPONSE FROM /oath/token ====\\033[0m");
System.out.println(response.toString());
System.out.println("\\033[32;1m==== -------- ---- ====\\033[0m");

          int code = conn.getResponseCode();
          if ( code != 200 ) {
            logger.warning(String.format("DocuSign oauth/token responded with HTTP %d", code));
            throw new DocuSignException(code, response);
          }

          JSONParser parser = x.create(JSONParser.class);
          accessTokens = (DocuSignAccessTokens)
            parser.parseString(response, DocuSignAccessTokens.class);
        } finally {
          if ( conn != null ) conn.disconnect();
        }
        
        return accessTokens;
      `
    }
  ]
});