foam.CLASS({
  package: 'foam.blob',
  name: 'Buffer',
  properties: [
    {
      class: 'Long',
      name: 'length'
    }
    {
      name: 'data',
      factory: function() {
        return new ArrayBuffer(this.length);
      }
    }
  ],
  methods: [
    function slice(start, end) {
      return foam.blob.Buffer.create({
        
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'BlobBlob',
  implements: ['foam.blob.Blob'],
  properties: [
    {
      name: 'blob',
      required: true
    },
    {
      name: 'size',
      getter: function() {
        return this.blob.size;
      }
    }
  ],
  methods: [
    function read(buffer, offset) {
      
    }
  ]
});
