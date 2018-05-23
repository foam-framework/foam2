foam.CLASS({
  package: 'foam.demos.net.nap.web',
  name: 'MessageboardFileUploadView',
  extends: 'foam.u2.Element',

  requires: [
    'foam.blob.BlobBlob',
    'foam.nanos.fs.File',
    'foam.u2.dialog.NotificationMessage'
  ],

  imports: [
    'user',
    'blobService'
  ],

  exports: [
    'as data',
    'onInvoiceFileRemoved'
  ],

  properties: [
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'data'
    }
  ],

  css: `
    ^ .attachment-input {
      width: 0.1px;
      height: 0.1px;
      opacity: 0;
      overflow: hidden;
      position: absolute;
      z-index: -1;
    }
    ^ .attachment-btn {
      margin: 10px 0 50px;
    }
    ^ .box-for-drag-drop {
      border: 5px dashed #1234;
      height: 100px;
      width: 200px;
    }
    ^ .inputText{
      text-align: center;
      line-height: 60px
    }
  `,

  messages: [
    { name: 'ErrorMessage', message: 'One or more file(s) were not uploaded as they exceeded the file size limit of 10MB' }
  ],

  methods: [
    function initE() {
      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .add(this.slot(function (data) {
            var e = this.E();
            for ( var i = 0 ; i < data.length ; i++ ) {
              e.tag({
                class: 'foam.demos.net.nap.web.model.MessageboardFileView',
                data: data[i],
                fileNumber: i + 1,
              });
            }
            return e;
          }, this.data$))
          .start(this.UPLOAD_BUTTON, { showLabel:true }).addClass('attachment-btn white-blue-button btn').end()
          .end()
        .end();
    },

    function onInvoiceFileRemoved (fileNumber) {
      this.document.querySelector('.attachment-input').value = null;
      this.data.splice(fileNumber - 1, 1);
      this.data = Array.from(this.data);
    }
  ],
  actions: [
    {
      name: 'uploadButton',
      label: 'Choose File',

      code: function(X) {
        X.ctrl.add(foam.u2.dialog.Popup.create(undefined, X).tag({class: 'net.nanopay.ui.modal.UploadModal', exportData$: this.data$}));
      }
    },
  ],
  listeners: [
    function onAddAttachmentClicked (e) {
      this.document.querySelector('.attachment-input').click();
    },
  ]
});
