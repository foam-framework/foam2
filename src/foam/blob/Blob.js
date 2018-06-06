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
  package: 'foam.blob',
  name: 'Buffer',

  properties: [
    {
      class: 'Long',
      name: 'length'
    },
    {
      name: 'data',
      factory: function() {
        return new ArrayBuffer(this.length);
      }
    }
  ],

  methods: [
    function slice(start, end) {
      return foam.blob.Buffer.create();
    }
  ]
});

foam.INTERFACE({
  package: 'foam.blob',
  name: 'Blob',

  javaExtends: [ 'java.io.Closeable' ],

  methods: [
    {
      name: 'read',
      returns: 'Promise',
      args: [
        {
          name: 'buffer',
        },
        {
          class: 'Long',
          swiftType: 'Int',
          name: 'offset'
        }
      ]
    },
    {
      name: 'getSize',
      returns: 'Long',
      swiftReturns: 'Int',
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
      returns: 'Promise',
      args: [
        {
          class: 'Blob',
          name: 'blob'
        }
      ]
    },
    {
      name: 'put_',
      returns: 'Promise',
      args: [
        {
          name: 'x',
          of: 'foam.core.X'
        },
        {
          class: 'Blob',
          name: 'blob'
        }
      ]
    },
    {
      name: 'find',
      returns: 'Promise',
      args: [
        {
          class: 'String',
          name: 'id'
        }
      ]
    },
    {
      name: 'find_',
      returns: 'Promise',
      args: [
        {
          name: 'x',
          of: 'foam.core.X'
        },
        {
          class: 'String',
          name: 'id'
        }
      ]
    },
    {
      name: 'urlFor',
      returns: 'String',
      args: [
        {
          class: 'Blob',
          name: 'blob'
        }
      ]
    },
    {
      name: 'urlFor_',
      returns: 'String',
      args: [
        {
          name: 'x',
          of: 'foam.core.X'
        },
        {
          class: 'Blob',
          name: 'blob'
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
    function pipe(writeFn) {
      var self = this;

      var offset = 0;
      var buf    = Buffer.alloc(8192 * 4);
      var limit  = self.size;

      function a() {
        if ( offset > limit ) {
          throw 'Offest beyond limit?';
        }

        if ( offset == limit ) return;

        return self.read(buf, offset).then(function(buf2) {
          offset += buf2.length;
          return writeFn(Buffer.from(buf2));
        }).then(a);
      };

      return a();
    },

    function slice(offset, length) {
      return foam.blob.SubBlob.create({
        parent: this,
        offset: offset,
        size: length
      });
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
      code: function (x) {
        return this.ProxyBlobService.create({ delegate: this }, x);
      }
    },

    function put(blob) {
      return this.put_(this.__context__, blob);
    },

    function find(id) {
      return this.find_(this.__context__, id);
    },

    function urlFor(blob) {
      return this.urlFor_(this.__context__, blob);
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
    function read(buffer, offset) {
      if ( buffer.length > this.size - offset) {
        buffer = buffer.slice(0, this.size - offset);
      }

      return this.parent.read(buffer, offset + this.offset);
    },
    function slice(offset, length) {
      return foam.blob.SubBlob.create({
        parent: this.parent,
        offset: this.offset + offset,
        size: length
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'BlobBlob',
  extends: 'foam.blob.AbstractBlob',

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
    function read(buffer, offset) {
      var self = this;
      var reader = new FileReader();

      var b = this.blob.slice(offset, offset + buffer.length);

      return new Promise(function(resolve, reject) {
        reader.onload = function(e) {
          resolve(e.result);
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
      cloneProperty: function(){},
      javaCloneProperty: '//nop',
      factory: function() {
        return this.blobService.find(this.id);
      },
      javaFactory: 'return ((BlobService) getBlobStore()).find(getId());'
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
      name: 'delegate'
    }
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
    function read(buffer, inOffset) {
      inOffset = inOffset || 0;
      var self = this;
      var outOffset = 0;
      var length = Math.min(buffer.length, this.size - inOffset);

      if ( length < buffer.length ) buffer = buffer.slice(0, length);

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
            resolve(buffer);
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
      }
    },
    {
      class: 'String',
      name: 'sha256',
      transient: true,
      documentation: 'Directory of where files are stored after hashing',
      expression: function(root) {
        return root + '/sha256';
      }
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
    function setup() {
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

    function ensureDir(path) {
      var stat;

      try {
        stat = require('fs').statSync(path);
        if ( stat && stat.isDirectory() ) return;
      } catch(e) {
        if ( e.code === 'ENOENT' ) return require('fs').mkdirSync(path);

        throw e;
      }
    },

    function allocateTmp() {
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

    function put_(x, obj) {
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

    function find_(x, id) {
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
        return foam.json.Parser.create({ creationContext: self }).parseString(payload);
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
