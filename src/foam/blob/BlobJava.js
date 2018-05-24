/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  refines: 'foam.blob.Blob',

  methods: [
    {
      name: 'read',
      javaReturns: 'long',
      args: [
        {
          name: 'out',
          javaType: 'java.io.OutputStream'
        },
        {
          name: 'offset',
          javaType: 'long'
        },
        {
          name: 'length',
          javaType: 'long'
        }
      ]
    },
    {
      name: 'getSize',
      javaReturns: 'long'
    },
    {
      name: 'close',
      javaReturns: 'void',
      javaThrows: [ 'java.io.IOException' ]
    }
  ]
});

foam.INTERFACE({
  refines: 'foam.blob.BlobService',

  methods: [
    {
      name: 'put',
      javaReturns: 'foam.blob.Blob',
      args: [
        {
          name: 'blob',
          javaType: 'foam.blob.Blob'
        }
      ]
    },
    {
      name: 'put_',
      javaReturns: 'foam.blob.Blob',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'blob',
          javaType: 'foam.blob.Blob'
        }
      ]
    },
    {
      name: 'find',
      javaReturns: 'foam.blob.Blob',
      args: [
        {
          name: 'id',
          javaType: 'Object'
        }
      ]
    },
    {
      name: 'find_',
      javaReturns: 'foam.blob.Blob',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'id',
          javaType: 'Object'
        }
      ]
    },
    {
      name: 'urlFor',
      javaReturns: 'String',
      args: [
        {
          name: 'blob',
          javaType: 'foam.blob.Blob'
        }
      ]
    },
    {
      name: 'urlFor_',
      javaReturns: 'String',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'blob',
          javaType: 'foam.blob.Blob'
        }
      ]
    }
  ]
});

foam.CLASS({
  refines: 'foam.blob.AbstractBlob',

  methods: [
    {
      name: 'pipe',
      javaCode: 'return;'
    },
    {
      name: 'slice',
      javaReturns: 'foam.blob.Blob',
      args: [
        {
          name: 'offset',
          javaType: 'long'
        },
        {
          name: 'length',
          javaType: 'long'
        }
      ],
      javaCode: 'return new SubBlob(this, offset, length);'
    },
    {
      name: 'close',
      javaCode: 'return;'
    }
  ]
});

foam.CLASS({
  refines: 'foam.blob.AbstractBlobService',

  methods: [
    {
      name: 'put',
      javaCode: 'return this.put_(getX(), blob);'
    },
    {
      name: 'find',
      javaCode: 'return this.find_(getX(), id);'
    },
    {
      name: 'urlFor',
      javaCode: 'return this.urlFor_(getX(), blob);'
    }
  ]
});

foam.CLASS({
  refines: 'foam.blob.SubBlob',

  methods: [
    {
      name: 'read',
      javaCode:
`length = Math.min(length, getSize() - offset);
return getParent().read(out, offset, length);`
    },
    {
      name: 'slice',
      javaCode: 'return new SubBlob(getParent(), getOffset() + offset, length);'
    }
  ]
});

foam.CLASS({
  refines: 'foam.blob.BlobStore',

  javaImports: [
    'org.apache.commons.io.IOUtils',
    'org.apache.commons.codec.binary.Hex',
    'java.io.File',
    'java.io.FileOutputStream',
    'foam.nanos.fs.Storage'
  ],

  constants: [
    {
      name: 'BUFFER_SIZE',
      value: 4096,
      type: 'int'
    }
  ],

  properties: [
    { class: 'String', name: 'tmp', javaFactory: 'return File.separator + "tmp";' },
    { class: 'String', name: 'sha256', javaFactory: 'return File.separator + "sha256";' }
  ],

  methods: [
    {
      name: 'put_',
      javaCode:
`if ( blob instanceof IdentifiedBlob ) {
  return blob;
}

this.setup(x);
HashingOutputStream os = null;

try {
  long size = blob.getSize();
  File tmp = allocateTmp(x, 1);
  os = new HashingOutputStream(new FileOutputStream(tmp));
  blob.read(os, 0, size);
  os.close();

  String digest = new String(Hex.encodeHexString(os.digest()));
  File dest = x.get(Storage.class).get(getSha256() + File.separator + digest);
  tmp.renameTo(dest);

  IdentifiedBlob result = new IdentifiedBlob();
  result.setId(digest);
  result.setX(getX());
  return result;
} catch (Throwable t) {
  return null;
} finally {
  IOUtils.closeQuietly(os);
}`
    },
    {
      name: 'find_',
      javaCode:
`try {
  this.setup(x);
  if ( ((String) id).indexOf(File.separatorChar) != -1 ) {
    throw new RuntimeException("Invalid file name");
  }

  File file = x.get(Storage.class).get(getSha256() + File.separator + id);
  if ( ! file.exists() ) {
    throw new RuntimeException("File does not exist");
  }

  if ( ! file.canRead() ) {
    throw new RuntimeException("Cannot read file");
  }

  return new FileBlob(file);
} catch (Throwable t) {
  throw new RuntimeException(t);
}`
    },
    {
      name: 'urlFor_',
      javaCode: 'throw new UnsupportedOperationException("Unsupported operation: urlFor_");'
    },
    {
      name: 'setup',
      javaReturns: 'void',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        }
      ],
      javaCode:
`if ( this.getIsSet() )
  return;
ensureDir(x, getTmp());
ensureDir(x, getSha256());
setIsSet(true);`
    },
    {
      name: 'ensureDir',
      javaReturns: 'void',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'path',
          javaType: 'String'
        }
      ],
      javaCode:
`File parsed = x.get(Storage.class).get(path);
if ( parsed.exists() && parsed.isDirectory() ) {
  return;
}

if ( ! parsed.mkdirs() ) {
  throw new RuntimeException("Failed to create: " + path);
}`
    },
    {
      name: 'allocateTmp',
      javaReturns: 'File',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'name',
          javaType: 'long'
        }
      ],
      javaCode:
`String path = this.tmp_ + File.separator + (name++);
File file = x.get(Storage.class).get(path);
if ( file.exists() ) {
  return allocateTmp(x, name);
}
return file;`
    }
  ]
});
