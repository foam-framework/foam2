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

  properties: [
    'data'
  ],

  methods: [
    function initE() {
      this.setNodeName('span')
        .start('input').attrs({ type: 'file' }).on('change', this.onChange).end()
        .add(this.slot(function(data) {
          return ! data ? this.E('span') : this.E('a')
            .attrs({
              href: data.data && data.data.blob ?
                URL.createObjectURL(data.data.blob) :
                data.address,
              target: '_blank',
              download: true
            })
            .add('Download');
        }, this.data$));
    }
  ],

  listeners: [
    function onChange (e) {
      var file = e.target.files[0];

      this.data = this.File.create({
        filename: file.name,
        filesize: file.size,
        mimeType: file.type,
        data: this.BlobBlob.create({
          blob: file
        })
      });
    }
  ]
});
