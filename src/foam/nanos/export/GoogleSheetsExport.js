foam.INTERFACE({
  package: 'foam.nanos.export',
  name: 'GoogleSheetsExport',
  methods: [
    {
      name: 'getCredentials',
      type: 'com.google.api.client.auth.oauth2.Credential',
      javaThrows: [ 'java.io.IOException' ],
      async: true,
      args: [
        {
          name: 'HTTP_TRANSPORT',
          type: 'com.google.api.client.http.javanet.NetHttpTransport'
        }
      ]
    },
    {
      name: 'createSheet',
      type: 'String',
    }
  ]
});