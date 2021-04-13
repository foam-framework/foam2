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
      name: 'image',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      readVisibility: 'RO',
      transient: true,
      expression: function () {
        return [this];
      },
      view: function() {
        let dataSlot = foam.core.SimpleSlot.create({value: [this]});
        let selectSlot = foam.core.SimpleSlot.create({value: 0});
        return foam.nanos.fs.fileDropZone.FilePreview.create({
          data$: dataSlot,
          selected$: selectSlot
        });
      }
    },
    {
      class: 'String',
      name: 'address',
      label: 'Download Link',
      transient: true,
      expression: function (id) {
        var sessionId = localStorage['defaultSession'];
        var url = window.location.origin + '/service/httpFileService/' + id
        // attach session id if available
        if ( sessionId ) {
          url += '?sessionId=' + sessionId;
        }
        return url;
      },
      view: 'foam.nanos.dig.LinkView'
    },
    {
      class: 'Blob',
      name: 'data',
      javaGetter:`
        if ( dataIsSet_ ) return data_;

        if ( ! SafetyUtil.isEmpty(this.getDataString()) ) {
          String          encodedString = this.getDataString().split(",")[1];
          byte[]          decodedBytes  = Base64.getDecoder().decode(encodedString);
          InputStream     is            = new ByteArrayInputStream(decodedBytes);
          InputStreamBlob blob          = new foam.blob.InputStreamBlob(is, decodedBytes.length);

          return blob;
        }

        return null;
      `,
      getter: function() {
        if ( this.dataString ) {
          let b64Data = this.dataString.split(',')[1];
          const b64toBlob = (b64Data, contentType = this.mimeType, sliceSize = 512) => {
            const byteCharacters = atob(b64Data);
            const byteArrays = [];

            for ( let offset = 0 ; offset < byteCharacters.length ; offset += sliceSize ) {
              const slice = byteCharacters.slice(offset, offset + sliceSize);

              const byteNumbers = new Array(slice.length);
              for ( let i = 0 ; i < slice.length ; i++ ) {
                byteNumbers[i] = slice.charCodeAt(i);
              }

              byteArrays.push(new Uint8Array(byteNumbers));
            }

            return new Blob(byteArrays, {type: contentType});
          }

          return this.BlobBlob.create({blob: b64toBlob(b64Data)});
        }

        return this.instance_.data || null;
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
    },
    {
      type: 'String',
      name: 'getText',
      code: function() {
        return new Promise((resolve, reject) => {
          let reader = new FileReader();

          reader.onload = () => {
            resolve(reader.result);
          };

          reader.onerror = reject;

          reader.readAsText(this.data.blob);
        });
      },
      javaCode: `
        if ( ! SafetyUtil.isEmpty(this.getDataString()) ) {
          String encodedString = this.getDataString().split(",")[1];
          byte[] decodedBytes  = Base64.getDecoder().decode(encodedString);
          String decodedString = new String(decodedBytes);
          return decodedString;
        }
        return "";
      `
    }
  ]
});
