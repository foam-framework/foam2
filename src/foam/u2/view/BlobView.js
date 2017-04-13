foam.CLASS({
  package: 'foam.u2.view',
  name: 'BlobView',
  extends: 'foam.u2.Element',
  requires: [
    'foam.blob.BlobBlob'
  ],
  imports: [
    'blobService'
  ],
  properties: [
    'data',
    {
      class: 'String',
      name: 'filename'
    },
    {
      class: 'String',
      name: 'type'
    },
    {
      class: 'DateTime',
      name: 'timestamp'
    }
  ],
  methods: [
    function initE() {
      var view = this;
      this.
        setNodeName('span').
        start('input').attrs({ type: 'file' }).on('change', this.onChange).end().
        add(this.slot(function(data) {
          var url = data && view.blobService.urlFor(data);
          return ! url ? this.E('span') :
            this.E('a').attrs({ href: url }).add('Download')
        }, this.data$));
    }
  ],
  listeners: [
    function onChange(e) {
      var file = e.target.files[0];

      this.data = this.BlobBlob.create({
        blob: file
      });
      this.filename = file.name;
      this.timestamp = new Date(file.lastModified);
      this.type = file.type;
    }
  ]
});
