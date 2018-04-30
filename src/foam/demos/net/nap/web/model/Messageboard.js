/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.net.nap.web.model',
  name: 'Messageboard',

  tableColumns: [
    'id', 'title', 'createdDate', 'creator'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'title'
    },
    {
      class: 'String',
      name: 'creator',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'DateTime',
      name: 'createdDate',
      visibility: foam.u2.Visibility.RO,
      factory: function(){
        return new Date();
      }
    },
    {
      class: 'String',
      name: 'content',
      view: { class: 'foam.u2.tag.TextArea', rows: 40, cols: 120}
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'messageboardFile',
      view: { class: 'net.nanopay.invoice.ui.InvoiceFileUploadView' }
    }
  ]
});
