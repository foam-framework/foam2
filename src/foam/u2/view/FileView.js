/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'FileView',
  extends: 'foam.u2.Element',

  requires: [
    'foam.blob.BlobBlob',
    'foam.nanos.fs.File'
  ],

  imports: [
    'blobService'
  ],

  properties: [
    'data'
  ],

  methods: [
    function initE() {
      var view = this;
      this.setNodeName('span')
        .start('input').attrs({ type: 'file' }).on('change', this.onChange).end()
        .add(this.slot(function(data) {
          var file = data.data;
          var url = file && view.blobService.urlFor(file);
          return ! url ? this.E('span') : this.E('a').attrs({ href: url }).add('Download')
        }, this.data$));
    }
  ],

  listeners: [
    function onChange (e) {
      var file = e.target.files[0];

      this.data = this.File.create({
        filename: file.name,
        mimeType: file.type,
        data: file
      });
    }
  ]
});
