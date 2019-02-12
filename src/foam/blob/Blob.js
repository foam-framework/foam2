/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
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

foam.INTERFACE({
  package: 'foam.blob',
  name: 'Blob',

  methods: [
    {
      name: 'read',
      async: true,
      type: 'Long',
      args: [
        {
          name: 'out',
          javaType: 'java.io.OutputStream'
        },
        {
          name: 'offset',
          type: 'Long'
        },
        {
          name: 'length',
          type: 'Long'
        }
      ]
    },
    // TODO: Decide on whether we're adding properties and especially
    // read-only properties to interfaces.  It seems inconsistent to
    // use .getSize() in JS when most other property like things are
    // done with just .size
    {
      name: 'getSize',
      type: 'Long'
    }
  ]
});

foam.INTERFACE({
  package: 'foam.blob',
  name: 'BlobService',

  documentation: 'BlobService Interface',

  methods: [
    {
      name: 'put',
      async: true,
      type: 'foam.blob.Blob',
      args: [
        {
          name: 'blob',
          type: 'foam.blob.Blob'
        }
      ]
    },
    {
      name: 'put_',
      async: 'true',
      type: 'foam.blob.Blob',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'blob',
          type: 'foam.blob.Blob'
        }
      ]
    },
    {
      name: 'find',
      async: true,
      type: 'foam.blob.Blob',
      args: [
        {
          name: 'id',
          type: 'Any'
        }
      ]
    },
    {
      name: 'find_',
      async: true,
      type: 'foam.blob.Blob',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'id',
          type: 'Any'
        }
      ]
    },
    {
      name: 'urlFor',
      type: 'String',
      args: [
        {
          name: 'blob',
          type: 'foam.blob.Blob'
        }
      ]
    },
    {
      name: 'urlFor_',
      type: 'String',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'blob',
          type: 'foam.blob.Blob'
        }
      ]
    }
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'AbstractBlob',
  abstract: true,

  implements: [ 'foam.blob.Blob' ],

  methods: [
    {
      name: 'slice',
      type: 'foam.blob.Blob',
      args: [ { name: 'offset', type: 'Long' },
              { name: 'length', type: 'Long' } ],
      code: function slice(offset, length) {
        return foam.blob.SubBlob.create({
          parent: this,
          offset: offset,
          size: length
        });
      },
      javaCode: 'return new SubBlob.Builder(getX()).setParent(this).setOffset(offset).setSize(length).build();'
    }
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'AbstractBlobService',
  abstract: true,

  implements: [ 'foam.blob.BlobService' ],

  requires: [
    'foam.blob.ProxyBlobService'
  ],

  methods: [
    {
      name: 'inX',
      type: 'foam.blob.BlobService',
      args: [ { name: 'x', type: 'Context' }],
      code: function (x) {
        return this.ProxyBlobService.create({ delegate: this }, x);
      },
      javaCode: 'return new foam.blob.ProxyBlobService.Builder(x).setDelegate(this).build();'
    },
    {
      name: 'put',
      code: function put(blob) {
        return this.put_(this.__context__, blob);
      },
      javaCode: 'return this.put_(getX(), blob);'
    },
    {
      name: 'find',
      code: function find(id) {
        return this.find_(this.__context__, id);
      },
      javaCode: 'return this.find_(getX(), id);'
    },
    {
      name: 'urlFor',
      code: function urlFor(blob) {
        return this.urlFor_(this.__context__, blob);
      },
      javaCode: 'return this.urlFor_(getX(), blob);'
    }
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'ProxyBlob',
  extends: 'foam.blob.AbstractBlob',

  documentation: 'Proxy implementation for the Blob interface',

  properties: [
    {
      class: 'Proxy',
      of: 'foam.blob.Blob',
      name: 'delegate',
      forwards: [ 'read', 'getSize' ]
    }
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'ProxyBlobService',
  extends: 'foam.blob.AbstractBlobService',

  documentation: 'Proxy implementation for the BlobService interface',

  properties: [
    {
      class: 'Proxy',
      of: 'foam.blob.BlobService',
      name: 'delegate',
      forwards: [ 'put_', 'find_', 'urlFor_' ]
    }
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'SubBlob',
  extends: 'foam.blob.AbstractBlob',

  properties: [
    {
      class: 'Blob',
      name: 'parent',
    },
    {
      class: 'Long',
      name: 'offset'
    },
    {
      class: 'Long',
      name: 'size',
      assertValue: function(value) {
        foam.assert(this.offset + value <= this.parent.size, 'Cannot create sub blob beyond end of parent.');
      }
    }
  ],

  methods: [
    {
      name: 'read',
      code: function read(buffer, offset) {
        if ( buffer.length > this.size - offset) {
          buffer = buffer.slice(0, this.size - offset);
        }

        return this.parent.read(buffer, offset + this.offset);
      },
      javaCode: `length = Math.min(length, getSize() - offset);
return getParent().read(out, offset, length);`
    },
    {
      name: 'slice',
      code: function slice(offset, length) {
        return foam.blob.SubBlob.create({
          parent: this.parent,
          offset: this.offset + offset,
          size: length
        });
      },
      javaCode: 'return new SubBlob(getParent(), getOffset() + offset, length);'
    }
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'BlobBlob',
  extends: 'foam.blob.AbstractBlob',
  flags: ['web'],

  properties: [
    'blob',
    {
      name: 'size',
      factory: function() {
        return this.blob.size;
      }
    }
  ],

  methods: [
    function read(out, offset, loength) {
      var self = this;
      var reader = new FileReader();

      var b = this.blob.slice(offset, offset + buffer.length);

      return new Promise(function(resolve, reject) {
        reader.onload = function(e) {
          out(e.result);
          resolve();
        };

        reader.onerror = function(e) {
          reject(e);
        };

        reader.readAsArrayBuffer(b);
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'IdentifiedBlob',
  extends: 'foam.blob.ProxyBlob',

  imports: [
    'blobStore?',
    'blobService'
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      name: 'delegate',
      transient: true,
      factory: function() {
        return this.blobService.find(this.id);
      },
      javaFactory: `
        return ((BlobService) getBlobStore()).find(getId());
      `,
      cloneProperty: function () {},
      diffProperty: function () {},
      javaCloneProperty: '// noop',
      javaDiffProperty: '// noop',
      javaCompare: 'return 0;',
      javaComparePropertyToObject: 'return 0;',
      javaComparePropertyToValue: 'return 0;',
    }
  ],

  methods: [
    function compareTo(other) {
      return foam.blob.IdentifiedBlob.isInstance(other) && other.id == this.id;
    },

    function read(buffer, offset) {
      return this.delegate.then(function(d) {
        return d.read(buffer, offset);
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Blob',
  extends: 'foam.core.FObjectProperty',

  properties: [
    [ 'type', 'foam.blob.Blob' ],
    [ 'of', 'foam.blob.Blob' ],
    [ 'tableCellView', function() {} ],
    [ 'view', { class: 'foam.u2.view.BlobView' } ]
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'ClientBlob',
  extends: 'foam.blob.AbstractBlob',

  properties: [
    {
      class: 'Stub',
      of: 'foam.blob.Blob',
      name: 'delegate',
      methods: [ 'read' ]
    },
    {
      class: 'Long',
      name: 'size'
    }
  ],
  methods: [
    function getSize() { return this.size; }
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'FdBlob',
  extends: 'foam.blob.AbstractBlob',

  properties: [
    {
      name: 'fd'
    },
    {
      class: 'Long',
      name: 'size',
      expression: function(fd) {
        return require('fs').fstatSync(fd).size;
      }
    }
  ],

  methods: [
    function read(out, inOffset, length) {
      inOffset = inOffset || 0;
      var self = this;
      var outOffset = 0;
      var length = Math.min(length, this.size - inOffset);
      var bufer = Buffer.alloc(length);

      return new Promise(function(resolve, reject) {
        function onRead(err, bytesRead, buffer) {
          if ( err ) {
            reject(err);
            return;
          }

          outOffset += bytesRead;
          inOffset += bytesRead;

          if ( outOffset < length ) {
            throw new Error('Does this ever happen.');
//            require('fs').read(self.fd, buffer, outOffset, length - outOffset, inOffset, onRead);
          } else {
            out(buffer);
            resolve();
          }
        }

        require('fs').read(self.fd, buffer, outOffset, length - outOffset, inOffset, onRead);
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'BlobStore',
  extends: 'foam.blob.AbstractBlobService',

  requires: [
    'foam.blob.IdentifiedBlob'
  ],

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
      type: 'Integer'
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'root',
      generateJava: false,
      documentation: 'Root directory of where files are stored'
    },
    {
      class: 'String',
      name: 'tmp',
      transient: true,
      documentation: 'Temp directory of where files are stored before hashing',
      expression: function(root) {
        return root + '/tmp';
      },
      javaFactory: 'return File.separator + "tmp";'
    },
    {
      class: 'String',
      name: 'sha256',
      transient: true,
      documentation: 'Directory of where files are stored after hashing',
      expression: function(root) {
        return root + '/sha256';
      },
      javaFactory: 'return File.separator + "sha256";'
    },
    {
      class: 'Boolean',
      name: 'isSet',
      value: false,
      hidden: true,
      transient: true
    }
  ],

  methods: [
    {
      name: 'setup',
      type: 'Void',
      args: [ { name: 'x', type: 'Context' } ],
      code: function setup() {
        if ( this.isSet ) return;

        var parsed = require('path').parse(this.root);

        if ( ! require('fs').statSync(parsed.dir).isDirectory() ) {
          throw new Error(parsed.dir + ' is not a directory.');
        }

        this.ensureDir(this.root);
        this.ensureDir(this.tmp);
        this.ensureDir(this.sha256);

        this.isSet = true;
      },
      javaCode:`if ( this.getIsSet() )
  return;
ensureDir(x, getTmp());
ensureDir(x, getSha256());
setIsSet(true);`
    },
    {
      name: 'ensureDir',
      type: 'Void',
      args: [ { name: 'x', type: 'Context' },
              { name: 'path', type: 'String' } ],
      code: function ensureDir(path) {
        var stat;

        try {
          stat = require('fs').statSync(path);
          if ( stat && stat.isDirectory() ) return;
        } catch(e) {
          if ( e.code === 'ENOENT' ) return require('fs').mkdirSync(path);

          throw e;
        }
      },
      javaCode: `File parsed = x.get(Storage.class).get(path);
if ( parsed.exists() && parsed.isDirectory() ) {
  return;
}

if ( ! parsed.mkdirs() ) {
  throw new RuntimeException("Failed to create: " + path);
}`
    },
    {
      name: 'allocateTmp',
      javaType: 'File',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'name',
          type: 'Long'
        }
      ],
      code: function allocateTmp() {
        var fd;
        var path;
        //      var name = Math.floor(Math.random() * 0xFFFFFF)
        var name = 1;
        var self = this;

        return new Promise(function aaa(resolve, reject) {
          path = self.tmp + require('path').sep + (name++);
          fd = require('fs').open(path, 'wx', function onOpen(err, fd) {
            if ( err && err.code !== 'EEXIST' ) {
              reject(err);
              return;
            }

            if ( err ) aaa(resolve, reject);
            else resolve({ path: path, fd: fd});
          });
        });
      },
      javaCode: `String path = this.tmp_ + File.separator + (name++);
File file = x.get(Storage.class).get(path);
if ( file.exists() ) {
  return allocateTmp(x, name);
}
return file;`
    },

    {
      name: 'put_',
      code: function put_(x, obj) {
        if ( this.IdentifiedBlob.isInstance(obj) ) {
          return obj;
        }

        this.setup();
        // This process could probably be sped up a bit by
        // requesting chunks of the incoming blob in advance,
        // currently we wait until they're put into the write-stream's
        // buffer before requesitng the next chunk.

        var hash = require('crypto').createHash('sha256');

        var bufsize = 8192;
        var buffer = Buffer.alloc(bufsize);

        var size = obj.size
        var remaining = size;
        var offset = 0;
        var self = this;

        var chunks = Math.ceil(size / bufsize);

        function chunkOffset(i) {
          return i * bufsize;
        }

        var tmp;

        function writeChunk(chunk) {
          return obj.read(buffer, chunkOffset(chunk)).then(function(buf) {
            hash.update(buf);
            return new Promise(function(resolve, reject) {
              require('fs').write(tmp.fd, buf, 0, buf.length, function cb(err, written, buffer) {
                if ( err ) {
                  reject(err);
                  return;
                }

                if ( written !== buf.length ) {
                  console.warn("Didn't write entire chunk, does this ever happen?");
                  require('fs').write(tmp.fd, buf.slice(written), cb);
                  return;
                }

                resolve();
              });
            });
          });
        }

        var chunk = 0;
        return this.allocateTmp().then(function(tmpfile) {
          tmp = tmpfile;
        }).then(function a() {
          if ( chunk < chunks ) return writeChunk(chunk++).then(a);
        }).then(function() {
          return new Promise(function(resolve, reject) {
            require('fs').close(tmp.fd, function() {
              var digest = hash.digest('hex');
              require('fs').rename(tmp.path, self.sha256 + require('path').sep + digest, function(err) {
                if ( err ) {
                  reject(err);
                  return;
                }
                resolve(self.IdentifiedBlob.create({ id: digest }));
              });
            });
          });
        });
      },
      javaCode: `if ( blob instanceof IdentifiedBlob ) {
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
    function filename(blob) {
      if ( ! foam.blob.IdentifiedBlob.isInstance(blob) ) return null;

      var path = this.sha256 + require('path').sep + blob.id;
      try {
        require('fs').statSync(path);
      } catch(e) {
        return null;
      }

      return path;
    },

    {
      name: 'find_',
      code: function find_(x, id) {
        this.setup();
        if ( id.indexOf(require('path').sep) != -1 ) {
          return Promise.reject(new Error("Invalid file name"));
        }

        var self = this;

        return new Promise(function(resolve, reject) {
          require('fs').open(self.sha256 + require('path').sep + id, "r", function(err, fd) {
            if ( err ) {
              if ( err.code == 'ENOENT' ) {
                resolve(null);
                return;
              }

              reject(err);
              return;
            }
            resolve(foam.blob.FdBlob.create({ fd: fd }));
          });
        });
      },
      javaCode: `try {
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
      code: function() { throw new Error("Unsupported operation."); },
      javaCode: 'throw new UnsupportedOperationException("Unsupported operation: urlFor_");'
    }
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'RestBlobService',
  extends: 'foam.blob.AbstractBlobService',

  documentation: 'Implementation of a BlobService against a REST interface.',

  requires: [
    'foam.net.HTTPRequest',
    'foam.blob.BlobBlob',
    'foam.blob.IdentifiedBlob'
  ],

  properties: [
    {
      class: 'String',
      name: 'serviceName'
    },
    {
      class: 'String',
      name: 'address',
      factory: function() {
        return window.location.origin + '/' + this.serviceName;
      }
    }
  ],

  methods: [
    function put_(x, blob) {
      if ( this.IdentifiedBlob.isInstance(blob) ) {
        // Already stored.
        return Promise.resolve(blob);
      }

      var url = this.address;
      var sessionId = localStorage['defaultSession'];
      // attach session id if available
      if ( sessionId ) {
        url += '?sessionId=' + sessionId;
      }

      var req = this.HTTPRequest.create();
      req.fromUrl(url);
      req.method = 'PUT';
      req.payload = blob;

      var self = this;

      return req.send().then(function(resp) {
        return resp.payload;
      }).then(function(payload) {
        return foam.json.Parser.create({ creationContext: self.__context__ }).parseString(payload);
      });
    },

    function urlFor_(x, blob) {
      if ( ! foam.blob.IdentifiedBlob.isInstance(blob) ) {
        return null;
      }

      var url = this.address + '/' + blob.id;
      var sessionId = localStorage['defaultSession'];
      // attach session id if available
      if ( sessionId ) {
        url += '?sessionId=' + sessionId;
      }
      return url;
    },

    function find_(x, id) {
      var url = this.address + '/' + id;
      var sessionId = localStorage['defaultSession'];
      // attach session id if available
      if ( sessionId ) {
        url += '?sessionId=' + sessionId;
      }

      var req = this.HTTPRequest.create();
      req.fromUrl(url);
      req.method = 'GET';
      req.responseType = 'blob';

      var self = this;
      return req.send().then(function(resp) {
        return resp.payload;
      }).then(function(blob) {
        return self.BlobBlob.create({
          blob: blob
        });
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'BlobServiceDecorator',
  extends: 'foam.dao.AbstractDAODecorator',

  imports: [
    'blobService'
  ],

  properties: [
    {
      class: 'Class',
      name: 'of'
    }
  ],

  methods: [
    function write(X, dao, obj, existing) {
      var i = 0;
      var props = obj.cls_.getAxiomsByClass(foam.core.Blob);
      var self = this;

      return Promise.resolve().then(function a() {
        var prop = props[i++];

        if ( ! prop ) return obj;

        var blob = prop.f(obj);

        if ( ! blob ) return a();

        return self.blobService.put(blob).then(function(b) {
          prop.set(obj, b);
          return a();
        });
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'TestBlobService',
  extends: 'foam.blob.AbstractBlobService',

  requires: [
    'foam.blob.IdentifiedBlob',
    'foam.blob.BlobBlob'
  ],

  properties: [
    {
      class: 'Map',
      name: 'blobs'
    },
    {
      class: 'Int',
      name: 'nextId',
      value: 1
    }
  ],

  methods: [
    function put_(x, file) {
      var id = this.nextId++;
      this.blobs[id] = file;
      return Promise.resolve(this.IdentifiedBlob.create({ id: id }));
    },

    function find_(x, id) {
      return Promise.resolve(this.blobs[id] ?
                             this.BlobBlob.create({ blob: this.blobs[id] }) :
                             null);
    },

    function urlFor_(x, blob) {
      if ( this.IdentifiedBlob.isInstance(blob) ) {
        return URL.createObjectURL(this.blobs[blob.id]);
      } else if ( this.BlobBlob.isInstance(blob) ) {
        return URL.createObjectURL(blob.blob);
      }

      return null;
    }
  ]
});
