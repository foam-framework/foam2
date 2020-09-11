/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'File',

  documentation: 'Represents a file',

  implements: [
    'foam.nanos.auth.Authorizable'
  ],

  requires: [
    'foam.blob.BlobBlob'
  ],

  javaImports: [
    'foam.blob.BlobService',
    'foam.blob.Blob',
    'foam.blob.InputStreamBlob',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'java.io.*',
    'java.util.Base64'
  ],

  tableColumns: [
      'id',
      'filename',
      'filesize',
      'mimeType'
    ],

  properties: [
    {
      class: 'String',
      name: 'id',
      documentation: 'GUID'
    },
    {
      class: 'String',
      name: 'filename',
      documentation: 'Filename'
    },
    {
      class: 'Long',
      name: 'filesize',
      documentation: 'Filesize'
    },
    {
      class: 'String',
      name: 'mimeType',
      documentation: 'File mime type'
    },
    {
      class: 'String',
      name: 'dataString',
      documentation: 'File converted to base64 string'
    },
    {
      class: 'String',
      name: 'address',
      transient: true,
      expression: function (id) {
        var sessionId = localStorage['defaultSession'];
        var url = window.location.origin + '/service/httpFileService/' + id
        // attach session id if available
        if ( sessionId ) {
          url += '?sessionId=' + sessionId;
        }
        return url;
      }
    },
    {
      class: 'Blob',
      name: 'data',
      javaGetter:`
        if ( dataIsSet_ ) return data_;
        if ( ! SafetyUtil.isEmpty(this.getDataString()) ) {
          String encodedString = this.getDataString().split(",")[1];
          BlobService blobStore = new foam.blob.BlobStore();
          byte[] decodedBytes = Base64.getDecoder().decode(encodedString);
          InputStream is = new ByteArrayInputStream(decodedBytes);
          InputStreamBlob blob = new foam.blob.InputStreamBlob(is, decodedBytes.length);
          return blob;
        } else {
          return null;
        }
      `,
      getter: function() {
        if ( this.dataString ) {
          let b64Data = this.dataString.split(',')[1];
          const b64toBlob = (b64Data, contentType=this.mimeType, sliceSize=512) => {
            const byteCharacters = atob(b64Data);
            const byteArrays = [];

            for ( let offset = 0; offset < byteCharacters.length; offset += sliceSize ) {
              const slice = byteCharacters.slice(offset, offset + sliceSize);

              const byteNumbers = new Array(slice.length);
              for ( let i = 0; i < slice.length; i++ ) {
                byteNumbers[i] = slice.charCodeAt(i);
              }

              const byteArray = new Uint8Array(byteNumbers);
              byteArrays.push(byteArray);
            }

            const blob = new Blob(byteArrays, {type: contentType});
            return  blob;
          }
          return this.BlobBlob.create({
            blob: b64toBlob(b64Data)
          });
        } else {
          var v = this.instance_["data"];
          return v !== undefined ? v : null ;
        }
      },
      /**
       * When we export this as the CSV, we are trying to create a new object if this property is undefined.
       * But because this 'Blob' is an interface, we can not instantiate it.
       *
       * Provide an adapt function will fix that issue.
       */
      adapt: function(oldObj, newObj) {
        return newObj;
      }
    }
  ],
  methods: [
    {
      name: 'authorizeOnCreate',
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        if ( ! auth.check(x, "file.create") ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
        // KeyValueDAO will return the same object if it is update operation
        // No changes will be made
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        if ( ! auth.check(x, "file.remove." + getId()) ) {
          throw new AuthorizationException();
        }
      `
    }
  ]
});
