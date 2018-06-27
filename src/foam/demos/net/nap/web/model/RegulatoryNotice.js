/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.net.nap.web.model',
  name: 'RegulatoryNotice',

  tableColumns: [
    'mark', 'title', 'createdDate', 'creator', 'attachment', 'hits'
  ],

  imports: [
    'blobService',
    'regulatoryNoticeDAO',
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
      name: 'starmark',
      tableCellFormatter: function(value, obj, property) {
        this
          .start()
            .callIf(value, function() {
              this.tag({ class: 'foam.u2.tag.Image', data: 'images/star.svg' }).style({'width': '25'});
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
      class: 'Long',
      name: 'hits',
      label: 'Hits',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'data',
      label: 'Attachments',
      documentation: 'Additional documents for RegulatoryNotice',
      view: { class: 'net.nanopay.invoice.ui.InvoiceFileUploadView', data:this.data$}
    }
  ]
});
