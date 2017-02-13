foam.CLASS({
  refines: 'foam.blob.Buffer',
  properties: [
    {
      name: 'buffer',
      factory: function() {
        return new Buffer(this.length);
      }
  ],
  methods: [
    function slice(start, end) {
      return foam.blob.Buffer.create({
        length: end - start,
        buffer: this.buffer.slice(start, end)
      });
    }
  ]
});
