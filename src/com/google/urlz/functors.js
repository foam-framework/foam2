/**
 * @license
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

// Most functors are async/blocking, but may offer a synchronous+fast
// version as well
foam.INTERFACE({
  package: 'com.google.urlz',
  name: 'Functor',
  methods: [
    {
      name: 'f',
      args: [
        'object', // the local object to operate on (if remote, it will always be resolved prior to calling f())
        'scope'   // runtime context for temporary storage
      ],
      returns: 'Thenable'
    },
    { name: 'toSync' }, // returns FunctorSync or fails
    //{ name: 'runCost' }, // maybe??
  ]
})

foam.INTERFACE({
  package: 'com.google.urlz',
  name: 'FunctorSync',
  methods: [
    {
      name: 'fsync'
    },
    {
      name: 'toAsync'
    }
  ]
});

foam.CLASS({
  name: 'FunctorProperty',
  package: 'com.google.urlz',
  extends: 'foam.core.Property',

  properties: [
    {
      name: 'adapt',
      value: function(old, nu) {
        if ( com.google.urlz.Functor.isInstance(nu) ) {
          return nu;
        } else if ( foam.Function.isInstance(nu) ) {
          return com.google.urlz.functors.Func.create({ fn: nu });
        }
        return com.google.urlz.functors.Constant.create({ value: nu });
      }
    }
  ]
});

foam.CLASS({
  name: 'Path',
  package: 'com.google.urlz',
  
  methods: [
    function fromStringUrl(url) { // actually a static method
      // return path from string
      var returnPath = ( url.startsWith('/') || url.contains('://') ) ? 
        com.google.urlz.AbsolutePath.create() : com.google.urlz.RelativePath.create();
      var curPath;
      
      var parts = url.split('/');
      for ( var i = 1; i < parts.length; ++i ) {
        var p = parts[i];
        // skip empty or https: bits
        if ( !p || p.isEmpty() || p.contains(':') ) continue; // TODO: regex instead
        if ( !curPath ) {
          returnPath.name = p; // grab first valid identifier for the base Absolute/Relative path object
          curPath = returnPath;
        } else {
          curPath.next = com.google.urlz.RelativePath.create({ name: p });
          curPath = curPath.next;         
        }
      }
      return returnPath;
    },
    function relativeTo(prefix) {
      // TODO: subtract prefix, return relative
    },
    function addRelative(subpath) {
      // convert subpath from string if given as string
      // TODO: clone and return this + subpath
    }
  ],
  
  properties: [
    'name', // string, one piece of path
    'next' // next RelativePath instance 
  ]
});
// TODO: remove this static method hack
var __tempPath__ = com.google.urlz.Path.create();
com.google.urlz.Path.fromStringUrl = __tempPath__.fromStringUrl;

foam.CLASS({
  name: 'AbsolutePath',
  package: 'com.google.urlz',
  extends: 'com.google.urlz.Path',
});
foam.CLASS({
  name: 'RelativePath',
  package: 'com.google.urlz',
  extends: 'com.google.urlz.Path'
});

foam.INTERFACE({
  name: 'DObject',
  package: 'com.google.urlz',

  properties: ['id'],
  //imports: [ 'src__' ],

  methods: [
    { name: 'run' }, // runs a functor on this
    { name: 'lookup', returns: 'Promise(DObject)' }, // traverses a path through sub-objects
    { name: 'getPath' }, // sync
  ]
});

foam.CLASS({
  name: 'DObjectLocal',
  package: 'com.google.urlz',
  implements: [
    'com.google.urlz.DObject',
    'com.google.urlz.Functor',
    'com.google.urlz.FunctorSync',
  ],

  properties: [
    'parent__'
  ],

  methods: [
    function getPath() {
      var p = parent__.getPath();
      return p.addRelative(this.id);
    },
    function lookup(path) { // TODO: consider a linked list here, easier to decompose
      // TODO: This is just a fetch(relativePath). Make fetch relative recursive, absolute or ../ goes to context
      // traverse a path through sub-objects
      var value = this[path.name];
      if ( path.next ) {
        return value.lookup(path.next); // no promise construction required...
      } else {
        // This is the last property lookup in the path, so return the contents
        return Promise.resolve(value); // only leaves construct a promise
      }
    }
    function f(obj, scope) {
      // By default, a local object returns itself
      return Promise.resolve(this);
    },
    function fsync(obj, scope) {
      return this;
    },
    function run(functor) {
      return functor.f(this, this.__context__.createSubContext());
    },
    function toSync() {
      return this;
    }
  ],
});

foam.CLASS({
  name: 'DObjectRemote',
  package: 'com.google.urlz',
  implements: [
    'com.google.urlz.DObject',
    'com.google.urlz.Functor'
  ],

  imports: ['Fetch'],
  
  properties: [ 
    {
      /** Path to source of this stub object */
      name: 'src__',
      required: true
    },
  ],

  methods: [
    function lookup(path) {
      // For remote object, fetch remote property contents and lookup on it
      // TODO: cache the fetched contents, if policy allows
      return this.Fetch(this.src__.addRelative(path));
    },
    function f(obj, scope) {
      // async object loads itself when run as a functor
      return this.Fetch(this.src__);
    },
    function run(functor) {
      // get actual copy of object and run the functor
      return this.f().then(o => functor.f(o, o.__context__.createSubContext()));
      // more advanced impl. may send the functor off to run remotely
    },
    function toSync() {
      // TODO: Could convert to DObjectLocal IF usage of the object can be saved reliably (fetch -> run -> commit)
      return com.google.urlz.functors.Error.create({ message: "Remote object cannot toSync(). Explicitly Fetch() a local copy." });
    }
  ]
});

foam.CLASS({
  name: 'DObjectCached',
  package: 'com.google.urlz',

  extends: 'com.google.urlz.DObjectLocal',
  implements: [
    'com.google.urlz.Functor'
  ],

  requires: [
    'com.google.urlz.DObjectLocal',
    'com.google.urlz.DObjectRemote',
    'com.google.urlz.Error',
  ],

  properties: [
    {
      class: 'Date',
      name: 'expiry__',
      factory: function() {
        // Expire in a minute.
        return new Date(Date.now() + ( 60 * 1000 ) );
      }
    }
  ],

  methods: [
    function f(obj, scope) {
      return this.expired_() ? this.Fetch(this.getPath()).then(fd => fd.f(obj, scope)) :
          this.SUPER(obj, scope);
    },
    function run(functor) {
      return this.expired_() ? this.Fetch(this.getPath()).then(fd => fd.run(functor)) : this.SUPER(functor);
    },
    function toSync() {
      //return this.expired_() ? throw "Cached object expired, cannot toSync()." : this.SUPER();
      throw "Cannot guarantee toSync() on a cached object, the object may expire. Fetch() a local copy.";
    },
    function expired_() { return Date.now() > this.expiry__.getTime(); }
  ]
});

foam.CLASS({
  name: 'Error',
  package: 'com.google.urlz.functors',
  implements: [
    'com.google.urlz.Functor',
    'com.google.urlz.FunctorSync',
  ],

  properties: [
    'message'
  ],

  methods: [
    function f(obj, scope) {
      return Promise.reject(this.message);
    },
    function fsync(obj, scope) {
      throw this.message;
    }
  ]
});

foam.CLASS({
  name: 'Call',
  package: 'com.google.urlz.functors',
  implements: ['com.google.urlz.Functor'],

  properties: ['methodName', 'args'],

  methods: [
    function f(obj, scope) {
      var methodP = this.methodName.f(obj, scope);
      var ps = this.args.map(a => a.f(obj, scope));
      return methodP.then(method =>
        Promise.all(ps).then(args =>
          obj[method].apply(args))); // Note: this is always a local invocation of the method on a local object.
          // In the case of a remote object, this Call functor would be sent to the remote site or a local
          // copy Fetched by the stub when you call stubObj.run(ThisFunctor(...))
    },
    function toSync() {
      // convert method name arg
      var m = this.methodName.toSync();
      if ( ! com.google.urlz.functors.Error.isInstance(m) ) {
        // convert arguments
        var sArgs = this.args.map(a => a.toSync());
        if ( sArgs.some(a => com.google.urlz.functors.Error.isInstance(a)) ) {
          return com.google.urlz.functors.Error.create("Not all method args can be made synchronous." + sArgs.toString());
        }
        return com.google.urlz.functors.CallSync({ methodName: m, args: sArgs });
      } else {
        return m;
      }
    }
  ],
});
foam.CLASS({
  name: 'CallSync',
  package: 'com.google.urlz.functors',
  implements: [
    'com.google.urlz.FunctorSync',
    'com.google.urlz.Functor',
  ],

  properties: ['methodName', 'args'],

  methods: [
    function fsync(obj, scope) {
      return obj[methodName.f(obj, scope)].apply(this.args.map(a => a.f(obj, scope)));
    },
    function f(obj, scope) {
      // If we're synchronous, implementing async is easy.
      return Promise.resolve(this.fsync(obj, scope));
    },
    function toASync() {
      return this;
    }
  ],
});

foam.INTERFACE({
  name: 'Collection',
  package: 'com.google.urlz',

  methods: [
    'create', 'read', 'update', 'delete',
    'enumerator', // returns Functor
    function lookup(pathNameArray) {
      return this.read(path.name).then(obj => obj.lookup(path.next);
    }
  ]
});
foam.CLASS({
  name: 'MapEnumerator', // for use with MapCollection
  package: 'com.google.urlz',

  properties: [
    'delegate'
  ],

  methods: [
    function f(obj, scope) {
      for (key in obj.map) {
        this.delegate.f(obj.map[key]);
      }
    }
  ]
});

foam.CLASS({
  name: 'Select',
  package: 'com.google.urlz.functors',

  properties: ['delegate'],

  methods: [
    function f(obj, scope) {
      // obj is a collection
      var enumerator = obj.enumerator(this.delegate); // do not .f() the delegate, let enumerator() optimize it
      return enumerator.f(obj, scope.createSubContext());
    },
  ],
});

foam.CLASS({
  name: 'Constant',
  package: 'com.google.urlz.functors',

  properties: ['value'],

  methods: [
    function f(obj, scope) {
      return Promise.resolve(this.value);
    },
  ]
});

foam.CLASS({
  name: 'Run',
  package: 'com.google.urlz.functors',

  properties: [
    'arg', // argument to resolve and pass into delegate
    'delegate' // functor to execute with a new arg
  ],

  methods: [
    function f(obj, scope) {
      return arg.f(obj, scope).then(a => delegate.f(a, scope));
    },
  ]
});

foam.CLASS({
  name: 'Func',
  package: 'com.google.urlz.functors',
  document: "Warning! Func is not safely capable of serialization or remote execution. \
  Do not use unless backed into a corner!",

  properties: [
    'fn', // a function primitive to run on objects (may not serialize!)
  ],

  methods: [
    function f(obj, scope) {
      return this.fn(obj, scope);
    },
  ]
});
