/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ImageBlobView',
  extends: 'foam.u2.View',
  requires: [
    'foam.blob.BlobBlob'
  ],
  imports: [
    'blobService'
  ],
  properties: [
    'data',
  ],
  methods: [
    function initE() {
      var view = this;
      this.
        start('img').
        attrs({
          src: this.data$.map(function(data) {
            return view.blobService.urlFor(data) || '';
          })
        }).
        end().
        add(this.slot(function(mode) {
          if ( mode == foam.u2.DisplayMode.RW ) {
            return this.
              E('input').
              attrs({ type: 'file' }).
              on('change', this.onChange);
          }
          return this.E('span');
        }, this.mode$));
    }
  ],
  listeners: [
    function onChange(e) {
      var file = e.target.files[0];

      this.data = this.BlobBlob.create({
        blob: file
      });
    }
  ]
});
