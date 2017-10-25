/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  refines: 'foam.blob.Buffer',

  javaImports: [
    'java.nio.ByteBuffer'
  ],

  methods: [
    {
      name: 'slice',
      javaReturns: 'foam.blob.Buffer',
      args: [
        {
          name: 'start',
          javaType: 'int'
        },
        {
          name: 'end',
          javaType: 'int'
        }
      ],
      javaCode: 'return new Buffer(end - start, ByteBuffer.wrap(getData().array(), start, end - start));'
    }
  ]
});

foam.INTERFACE({
  refines: 'foam.blob.Blob',

  methods: [
    {
      name: 'read',
      javaReturns: 'foam.blob.Buffer',
      args: [
        {
          name: 'buffer',
          javaType: 'foam.blob.Buffer'
        },
        {
          name: 'offset',
          javaType: 'int'
        }
      ]
    },
    {
      name: 'getSize',
      javaReturns: 'int'
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
          javaType: 'int'
        },
        {
          name: 'length',
          javaType: 'int'
        }
      ],
      javaCode: 'return new SubBlob(this, offset, length);'
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
`if ( buffer.getLength() > getSize() - offset ) {
  buffer = buffer.slice(0, getSize() - offset);
}

return getParent().read(buffer, offset + getOffset());`
    },
    {
      name: 'slice',
      javaCode: 'return new SubBlob(getParent(), getOffset() + offset, length);'
    }
  ]
});
