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
    'foam.nanos.auth.Authorizable',
//    'foam.nanos.auth.ServiceProviderAware'
  ],

  requires: [
    'foam.blob.BlobBlob'
  ],

  imports: [
    'fileTypeDAO'
  ],

  javaImports: [
    'foam.blob.BlobService',
    'foam.blob.Blob',
    'foam.blob.InputStreamBlob',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
//    'foam.nanos.auth.ServiceProviderAwareSupport',
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

  searchColumns: [
    'id',
    'filename',
    'mimeType'
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      createVisibility: 'HIDDEN',
      updatevisibility: 'RO',
      readVisibility: 'RO',
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
      updateVisibility: 'RO',
      readVisibility: 'RO',
      documentation: 'Filesize'
    },
    {
      class: 'String',
      name: 'mimeType',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      readVisibility: 'RO',
      documentation: 'File mime type'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.fs.FileType',
      name: 'fileType',
      label: 'Mime Type',
      updateVisibility: 'HIDDEN',
      readVisibility: 'HIDDEN',
      documentation: 'File mime type',
      storageTransient: true,
    },
    {
      class: 'String',
      name: 'dataString',
      updateVisibility: 'RO',
      readVisibility: 'RO',
      documentation: 'File converted to base64 string',
      view: {
        class: 'foam.u2.MultiView',
        views: [
          {
            class: 'foam.u2.tag.TextArea',
            rows: 4, cols: 80
          }
        ]
      },
    },
    {
      class: 'String',
      name: 'address',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      readVisibility: 'RO',
      transient: true,
      expression: function (id) {
        return window.location.origin + '/service/httpFileService/' + id
      }
    },
    {
      class: 'String',
      name: 'image',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      readVisibility: 'RO',
      transient: true,
      storageTransient: true,
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
      class: 'Blob',
      name: 'data',
      updateVisibility: 'HIDDEN',
      readVisibility: 'HIDDEN',
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
      getter: async function() {
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
    },
//    {
//      class: 'Reference',
//      of: 'foam.nanos.auth.ServiceProvider',
//      name: 'spid',
//      visibility: 'HIDDEN',
//      storageTransient: true,
//      section: 'systemInformation',
//      javaFactory: `
//        var map = new java.util.HashMap();
//        map.put(
//          File.class.getName(),
//          new foam.core.PropertyInfo[] { File.OWNER }
//        );
//        return new ServiceProviderAwareSupport()
//          .findSpid(foam.core.XLocator.get(), map, this);
//      `
//    },
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

          this.data.then((d) => reader.readAsText(d.blob));
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
