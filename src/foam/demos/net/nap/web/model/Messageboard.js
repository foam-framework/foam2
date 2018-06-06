/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.net.nap.web.model',
  name: 'Messageboard',

  tableColumns: [
    'mark', 'title', 'createdDate', 'creator', 'attachment'
  ],

  imports: [
    'blobService',
    'messageboardDAO',
    'user'
  ],

  javaImports: [ 'java.util.Date' ],

  requires: [
    'foam.blob.BlobBlob',
    'foam.nanos.fs.File',
    'foam.u2.dialog.NotificationMessage'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Boolean',
      name: 'mark',
      //view: { class: 'foam.u2.CheckBox' }
      tableCellFormatter: function(value, obj, property) {
        this
          .start()
            .call(function() {
              if ( value ) { this.tag({ class: 'foam.u2.tag.Image', data: 'images/star.svg' }).style({'width': '25'}); }
            })
          .end();
      }
    },
    {
      class: 'String',
      name: 'title',
      displayWidth: 100,
      width: 200
    },
    {
      class: 'String',
      name: 'creator',
      visibility: foam.u2.Visibility.RO,
      factory: function() { return this.user.firstName; }
    },
    {
      class: 'Long',
      name: 'creatorId',
      visibility: foam.u2.Visibility.RO,
      factory: function() { return this.user.id; },
      hidden: true
    },
    // {
    //   class: 'Reference',
    //   of: 'foam.nanos.auth.Group',
    //   name: 'groupId',
    //   view: { class: 'foam.u2.view.ReferenceView', placeholder: 'select group' }
    // },
    {
      class: 'DateTime',
      name: 'createdDate',
      visibility: foam.u2.Visibility.RO,
      factory: function() { return new Date(); },
      javaFactory: 'return new Date();',
      tableCellFormatter: function(date) {
        this.add(date ? date.toISOString().substring(0,10) : '');
      }
    },
    {
      class: 'String',
      name: 'content',
      view: { class: 'foam.u2.tag.TextArea', rows: 30, cols: 120}
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'data',
      label: 'Attachments',
      documentation: 'Additional documents for messageboard',
      view: { class: 'net.nanopay.invoice.ui.InvoiceFileUploadView', data:this.data$}
    }
  ]
});
