/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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
      async: true,
      args: [
        {
          name: 'obj',
          type: 'Object'
        },
        {
          name: 'metadataObj',
          type: 'foam.nanos.export.GoogleSheetsPropertyMetadata[]',
          javaType: 'Object'
        }
      ]
    }
  ]
});