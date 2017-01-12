/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'foam.core',
  name: 'Blob',
  extends: 'foam.core.Property',
  properties: [
    [ 'tableCellView', function() {} ]
  ]
});

foam.CLASS({
  package: 'foam.blob',
  name: 'ClientBlob',
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
  name: 'Buffer',
  properties: [
    {
      name: 'length',
      required: true,
      final: true
    },
    {
      name: 'buffer',
      toJSON: function(value) {
      },
      fromJSON: function(value) {
      }
    }
  ],
  methods: [
    function slice(start, length) {
    }
  ]
});

foam.CLASS({
  package: 'foam.blob',
  name: 'FdBlob',
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
            require('fs').read(self.fd, buffer, outOffset, length - outOffset, inOffset, onRead);
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
	  if ( err !== 'EEXIST' ) {
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

      // 4k chunks i guess
      var bufsize = 4096;
      var buffer = new Buffer(4096);
      
      var size = obj.size
      var remaining = size;
      var offset = 0;
      var self = this;

      var chunks = Math.ceil(size / bufsize);

      function chunkOffset(i) {
	return i * bufsize;
      }
      
      function chunkSize(i) {
	return i < chunks - 1 ?
	  bufsize :
	  size - chunkOffset(i > 0 ? (i - 1) : 0) ;
      }

      var tmp;

      function readChunk(chunk) {
	return obj.read(buffer, chunkOffset(chunk)).then(function(buf2) {
	  var buf = buffer.slice(0, chunkSize(chunk));
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
	return readChunk(chunk++).then(function asdf() {
	  if ( chunk < chunks ) return readChunk(chunk++);
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
      });
    },
  
    function find(id) {
      return new Promise(function(resolve, reject) {
	require('fs').open(this.sha256 + require('path').sep + id, function(err, fd) {
	  if ( err ) {
	    reject(err);
	    return;
	  }
	  resolve(foam.blob.FdBlob.create({ fd: fd }));
	});
      });
    }
  ]
});
