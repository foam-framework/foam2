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

foam.INTERFACE({
  package: 'foam.blob',
  name: 'Blob',

  properties: [
    {
      class: 'Long',
      name: 'size'
    }
  ],

  methods: [
    {
      name: 'read',
      returns: 'Promise',
      args: [
        {
          name: 'buffer',
        },
        {
          name: 'offset',
          of: 'Long'
        }
      ]
    }
  ]
});

foam.CLASS({
  package: 'foam.blob',
  name: 'AbstractBlob',
  implements: ['foam.blob.Blob'],
  methods: [
    function pipe(writeFn) {
      var self = this;

      var offset = 0;
      var buf = new Buffer(8192 * 4);
      var limit = self.size;

      function a() {
        if ( offset > limit ) {
          throw 'Offest beyond limit?';
        }

        if ( offset == limit ) return;

        return self.read(buf, offset).then(function(buf2) {
          offset += buf2.length;
          return writeFn(new Buffer(buf2));
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
  name: 'SubBlob',
  extends: 'foam.blob.AbstractBlob',
  properties: [
    {
      name: 'parent',
    },
    {
      name: 'offset'
    },
    {
      name: 'size',
      assertValue: function(value) {
        foam.assert(this.offset + value < this.parent.size, 'Cannot create sub blob beyond end of parent.');
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
  extends: 'foam.blob.AbstractBlob',
  imports: [
    'blobService?'
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
      }
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
      name: 'box'
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


if ( foam.isServer ) {

foam.CLASS({
  package: 'foam.blob',
  name: 'BlobStore',

  properties: [
    {
      class: 'String',
      name: 'root'
    },
    {
      class: 'String',
      name: 'tmp',
      expression: function(root) {
        return root + require('path').sep + 'tmp';
      }
    },
    {
      class: 'String',
      name: 'sha256',
      expression: function(root) {
        return root + require('path').sep + 'sha256';
      }
    },
    {
      class: 'Boolean',
      name: 'isSet',
      value: false
    }
  ],

  methods: [
    function setup() {
      if ( this.isSet ) return;
      var root = require('fs').statSync(this.root);

      if ( ! root.isDirectory() ) {
        throw new Error('Blob storage root is not a directory.');
      }

      this.ensureDir(this.tmp);
      this.ensureDir(this.sha256);

      this.isSet = true;
    },

    function ensureDir(path) {
      // TODO: Create all necessary parent directories.
      var stat = require('fs').statSync(path);
      if ( stat && stat.isDirectory() ) return;

      require('fs').mkdirSync(path);
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

    function put(obj) {
      // This process could probably be sped up a bit by
      // requesting chunks of the incoming blob in advance,
      // currently we wait until they're put into the write-stream's
      // buffer before requesitng the next chunk.

      var hash = require('crypto').createHash('sha256');

      var bufsize = 8192;
      var buffer = new Buffer(bufsize);

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
              resolve(digest);
            });
          });
        });
      });
    },

    function find(id) {
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

}

foam.CLASS({
  package: 'foam.blob',
  name: 'RestBlobService',
  documentation: 'Implementation of a BlobService against a REST interface.',
  requires: [
    'foam.net.HTTPRequest',
    'foam.blob.BlobBlob',
    'foam.blob.IdentifiedBlob'
  ],
  properties: [
    {
      class: 'String',
      name: 'address'
    }
  ],
  methods: [
    function put(blob) {
      if ( this.IdentifiedBlob.isInstance(blob) ) {
        // Already stored.
        return Promise.resolve(blob);
      }

      var req = this.HTTPRequest.create();
      req.fromUrl(this.address);
      req.method = 'PUT';
      req.payload = blob;

      var self = this;

      return req.send().then(function(resp) {
        return resp.payload;
      }).then(function(id) {
        return self.IdentifiedBlob.create({ id: id });
      });
    },
    function urlFor(blob) {
      if ( ! foam.blob.IdentifiedBlob.isInstance(blob) ) {
        return null;
      }

      return this.address + '/' + blob.id;
    },
    function find(id) {
      var req = this.HTTPRequest.create();
      req.fromUrl(this.address + '/' + id);
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
  implements: ['foam.dao.DAODecorator'],
  imports: [
    'blobService'
  ],
  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      name: 'props',
      expression: function(of) {
        return of.getAxiomsByClass(foam.core.Blob);
      }
    }
  ],
  methods: [
    function write(X, dao, obj, existing) {
      var i = 0;
      var props = this.props;
      var self = this;

      return Promise.resolve().then(function a() {
        var prop = props[i++];

        if ( ! prop ) return obj;

        var blob = prop.f(obj);

        if ( ! blob ) return obj;

        return self.blobService.put(blob).then(function(b) {
          prop.set(obj, b);
          return a();
        });
      });
    },
    function read(X, dao, obj) {
      return Promise.resolve(obj);
    },
    function remove(X, dao, obj) {
      return Promise.resolve(obj);
    }
  ]
});


foam.CLASS({
  package: 'foam.blob',
  name: 'TestBlobService',
  requires: [
    'foam.blob.IdentifiedBlob'
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
    function put(file) {
      var id = this.nextId++;
      this.blobs[id] = file;
      return Promise.resolve(this.IdentifiedBlob.create({ id }));
    },
    function find(id) {
      return Promise.resolve(this.blobs[id] || null);
    },
    function urlFor(id) {
      return URL.createObjectURL(this.blobs[id]);
    }
  ]
});
