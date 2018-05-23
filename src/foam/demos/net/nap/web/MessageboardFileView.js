foam.CLASS({
  package: 'foam.demos.net.nap.web',
  name: 'MessageboardFileView',
  extends: 'foam.u2.Element',

  requires: [
    'foam.blob.BlobBlob',
    'foam.nanos.fs.File'
  ],

  imports: [
    'blobService',
    'onInvoiceFileRemoved'
  ],

  exports: [
    'as data'
  ],

  properties: [
    'data',
    'fileNumber',
    [ 'removeHidden', false ]
  ],

  css: `
    ^ {
      min-width: 175px;
      max-width: 275px;
      height: 40px;
      background-color: #ffffff;
      padding-left: 10px;
      padding-right: 10px;
      padding-top: 5px;
    }
    ^ .attachment-number {
      float: left;
      width: 21px;
      height: 20px;
      font-size: 12px;
      line-height: 1.67;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
    }
    ^ .attachment-filename {
      max-width: 342px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      float: left;
    }
    ^ .attachment-filename a {
      height: 16px;
      font-size: 12px;
      line-height: 1.66;
      letter-spacing: 0.2px;
      text-align: left;
      color: #59a5d5;
      padding-left: 12px;
    }
    ^ .attachment-footer {
      float: right;
    }
    ^ .attachment-filesize {
      width: 16.7px;
      height: 8px;
      font-size: 6px;
      line-height: 1.33;
      letter-spacing: 0.1px;
      text-align: left;
      color: #a4b3b8;
      padding-top: 6px;
    }
    ^ .net-nanopay-ui-ActionView-remove {
      width: 12px;
      height: 12px;
      object-fit: contain;
    }
  `,

  methods: [
    function initE() {
      var self = this;

      this
        .addClass(this.myClass())
        .start().addClass('attachment-number')
          .add(this.formatFileNumber())
        .end()
        .start().addClass('attachment-filename')
          .start('a')
            .attrs({
              href: this.data$.map(function (data) {
                var blob = data.data;
                var sessionId = localStorage['defaultSession'];
                if ( self.BlobBlob.isInstance(blob) ) {
                  return URL.createObjectURL(blob.blob);
                } else {
                  var url = '/service/httpFileService/' + data.id;
                  // attach session id if available
                  if ( sessionId ) {
                    url += '?sessionId=' + sessionId;
                  }
                  return url;
                }
              }),
              target: '_blank'
            })
            .add(this.slot(function (filename) {
              var len = filename.length;
              return ( len > 35 ) ? (filename.substr(0, 20) +
                '...' + filename.substr(len - 10, len)) : filename;
            }, this.data.filename$))
          .end()
        .end()
        .start().addClass('attachment-footer')
          .start().add(this.REMOVE).hide(this.removeHidden).end()
          .start().addClass('attachment-filesize')
            .add(this.formatFileSize())
          .end()
        .end()
    },

    function formatFileNumber() {
      return ('000' + this.fileNumber).slice(-3);
    },

    function formatFileSize() {
      return Math.ceil(this.data.filesize / 1024) + 'K';
    }
  ],

  actions: [
    {
      name: 'remove',
      icon: 'images/ic-delete.svg',
      code: function (X) {
        this.onInvoiceFileRemoved(X.data.fileNumber);
      }
    }
  ]
});
