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

foam.CLASS({
  package: 'foam.dao',
  name: 'ProxyDAO',
  extends: 'foam.dao.AbstractDAO',
  requires: [
    'foam.dao.ProxyListener'
  ],

  documentation: 'Proxy implementation for the DAO interface.',

  properties: [
    {
      class: 'Proxy',
      of: 'foam.dao.DAO',
      name: 'delegate',
      forwards: [ 'put', 'remove', 'find', 'select', 'removeAll', 'listen' ],
      factory: function() { return foam.dao.NullDAO.create() },
    },
    {
      name: 'of',
      factory: function() {
        return this.delegate.of;
      }
    }
  ],
  methods: [
    function listen(sink, skip, limit, order, predicate) {
      var listener = this.ProxyListener.create({
        delegate: sink,
        args: [skip, limit, order, predicate]
      });

      listener.onDetach(listener.dao$.follow(this.delegate$));

      return listener;
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'ProxyListener',
  implements: ['foam.dao.Sink'],
  properties: [
    'args',
    'delegate',
    {
      name: 'innerSub',
      postSet: function(_, s) {
        if (s) this.onDetach(s);
      }
    },
    {
      name: 'dao',
      postSet: function(old, nu) {
        this.innerSub && this.innerSub.detach();
        this.innerSub = nu && nu.listen.apply(nu, [this].concat(this.args));
        if ( old ) this.reset();
      }
    }
  ],
  methods: [
    function put(s, obj) {
      this.delegate.put(this, obj);
    },
    function remove(s, obj) {
      this.delegate.remove(this, obj);
    },
    function reset(s) {
      this.delegate.reset(this);
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'ArraySink',
  extends: 'foam.dao.AbstractSink',

  properties: [
    {
      class: 'Array',
      name: 'a'
    }
  ],

  methods: [
    function put(sub, o) {
      this.a.push(o);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'PromisedDAO',
  implements: ['foam.dao.DAO'],

  properties: [
    {
      class: 'Promised',
      of: 'foam.dao.DAO',
      methods: [ 'put', 'remove', 'find', 'select', 'removeAll', 'listen' ],
      name: 'promise'
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'LocalStorageDAO',
  extends: 'foam.dao.ArrayDAO',

  properties: [
    {
      name:  'name',
      label: 'Store Name',
      class:  'foam.core.String'
    }
  ],

  methods: [
    function init() {
      var objs = localStorage.getItem(this.name);
      if ( objs ) this.array = foam.json.parseString(objs, this);

      this.on.put.sub(this.updated);
      this.on.remove.sub(this.updated);

      // TODO: base on an indexed DAO
    }
  ],

  listeners: [
    {
      name: 'updated',
      isMerged: true,
      mergeDelay: 100,
      code: function() {
        localStorage.setItem(this.name, foam.json.stringify(this.array));
      }
    }
  ]
});


foam.LIB({
  name: 'foam.String',
  methods: [
    {
      name: 'daoize',
      code: foam.Function.memoize1(function(str) {
        // Turns SomeClassName into someClassNameDAO,
        // of package.ClassName into package.ClassNameDAO
        return str.substring(0, 1).toLowerCase() + str.substring(1) + 'DAO';
      })
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'InvalidArgumentException',
  extends: 'foam.dao.ExternalException',
  properties: [
    {
      class: 'String',
      name: 'message'
    }
  ]
});

foam.INTERFACE({
  package: 'foam.dao',
  name: 'DAODecorator',
  methods: [
    {
      name: 'put',
      args: ['obj', 'existing']
    },
    {
      name: 'find',
      args: ['obj']
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'CompoundDAODecorator',
  properties: [
    {
      class: 'Array',
      name: 'decorators'
    }
  ],
  methods: [
    function put(obj, existing) {
      var i = 0;
      var d = this.decorators;

      return Promise.resolve(obj).then(function a(obj) {
        return d[i] ? d[i++].put(obj, existing).then(a) : obj;
      });
    },
    function find(obj) {
      var i = 0;
      var d = this.decorators;

      return Promise.resolve(obj).then(function a(obj) {
        return d[i] ? d[i++].find(obj).then(a) : obj;
      });
    }
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'DecoratedDAO',
  extends: 'foam.dao.ProxyDAO',
  properties: [
    {
      name: 'decorator'
    },
    {
      name: 'dao'
    }
  ],
  methods: [
    // TODO: What do we do for select?
    function put(obj) {
      // TODO: obj.id can generate garbase, would be
      // slightly faster if DAO.find() could take an object
      // as well.
      var self = this;
      return ( ( ! obj.id ) ? Promise.resolve(null) : this.dao.find(obj.id) ).then(function(existing) {
        return self.decorator.put(obj, existing);
      }).then(function(obj) {
        return self.delegate.put(obj);
      });
    },
    function find(id) {
      var self = this;
      return this.delegate.find(id).then(function(obj) {
        return self.decorator.find(obj);
      });
    }
  ]
});
