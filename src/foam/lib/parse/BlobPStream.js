/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.lib.parse',
  name: 'BlobPStream',
  implements: [
    'foam.lib.parse.PStream'
  ],
  properties: [
    {
      class: 'Blob',
      name: 'blob'
    },
    {
      class: 'Int',
      name: 'pos_'
    },
    {
      class: 'String',
      name: 'head_',
      javaFactory: `
        java.io.OutputStream os = new java.io.ByteArrayOutputStream(1);
        getBlob().read(os, getPos_(), 1);
        return os.toString();
      `
    },
    {
      class: 'FObjectProperty',
      of: 'foam.lib.parse.BlobPStream',
      name: 'tail_',
      javaFactory: `
        return new BlobPStream.Builder(getX())
          .setPos_(getPos_() + 1)
          .setBlob(getBlob())
          .build();
      `
    },
    {
      class: 'Object',
      name: 'value_'
    },
  ],
  methods: [
    {
      name: 'head',
      javaCode: `return getHead_().charAt(0);`
    },
    {
      name: 'valid',
      javaCode: `return getPos_() < getBlob().getSize();`
    },
    {
      name: 'tail',
      javaCode: `return getTail_();`
    },
    {
      name: 'value',
      javaCode: `return getValue_();`
    },
    {
      name: 'setValue',
      javaCode: `
        return new BlobPStream.Builder(getX())
          .setPos_(getPos_())
          .setBlob(getBlob())
          .setValue_(value)
          .build();
      `
    },
    {
      name: 'substring',
      javaCode: `
        BlobPStream endps = (BlobPStream) end;
        int length = endps.getPos_() - getPos_();
        java.io.OutputStream os = new java.io.ByteArrayOutputStream(length);
        getBlob().read(os, getPos_(), length);
        return os.toString();
      `
    },
    {
      name: 'apply',
      javaCode: `return ps.parse(this, x);`
    }
  ]
});
