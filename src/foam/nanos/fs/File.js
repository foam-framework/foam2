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

  javaImports: [
    'foam.blob.BlobService',
    'foam.blob.Blob',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'java.io.*',
    'java.util.Base64',
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
      class: 'Blob',
      name: 'dataBlob',
      documentation: 'File data as a blob',
      /**
       * When we export this as the CSV, we are trying to create a new object if this property is undefined.
       * But because this 'Blob' is an interface, we can not instantiate it.
       *
       * Provide an adapt function will fix that issue.
       */
      adapt: function(oldObj, newObj) {
        return newObj;
      },
    },
    {
      class: 'String',
      name: 'dataString',
      documentation: 'File converted to base64 string',
      javaSetter: `
        String base64 = Base64.getEncoder().encodeToString(val.getBytes());
        dataString_ = base64;
      `
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
    }
  ],

  methods: [
    {
      name: 'getData',
      type: 'foam.blob.Blob',
      javaCode:`
        if ( this.getDataString() != null && this.getDataString() != "" ){
          BlobService blobStore = new foam.blob.BlobStore();
          byte[] decodedBytes = Base64.getDecoder().decode(getDataString());
          InputStream is = new ByteArrayInputStream(decodedBytes);
          Blob data = blobStore.put(new foam.blob.InputStreamBlob(is, decodedBytes.length));
          return data;
        } else {
          return this.getDataBlob();
        }
      `,
      code: function() {
        if ( typeof this.dataString != 'undefined' && this.dataString != '' ) {
          let b64Data = this.data.split(',')[1];
          const b64toBlob = (b64Data, contentType=this.mimeType, sliceSize=512) => {
            const byteCharacters = atob(b64Data);
            const byteArrays = [];

            for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
              const slice = byteCharacters.slice(offset, offset + sliceSize);

              const byteNumbers = new Array(slice.length);
              for (let i = 0; i < slice.length; i++) {
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
        } else if ( typeof this.dataBlob != 'undefined' && this.dataBlob != '' ) {
            return this.dataBlob;
        } else {
          return null;
        }
      }
    },
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
        User user = ((Subject) x.get("subject")).getUser();
        if ( user != null && user.getId() == getOwner() ) return;

        AuthService auth = (AuthService) x.get("auth");
        if ( ! auth.check(x, "file.update." + getId()) ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        if ( ! auth.check(x, "file.delete." + getId()) ) {
          throw new AuthorizationException();
        }
      `
    }
  ]
});
