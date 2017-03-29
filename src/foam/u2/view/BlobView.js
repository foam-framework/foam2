foam.CLASS({
  package: 'foam.u2.view',
  name: 'BlobView',
  extends: 'foam.u2.Element',
  requires: [
    'foam.blob.BlobBlob'
  ],
  properties: [
    'data'
  ],
  methods: [
    function initE() {
      this.setNodeName('input').attrs({ type: 'file' }).on('change', this.onChange);
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
