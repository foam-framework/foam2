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

// TODO: the name of this is confusing because it overloads the term
// "DAO Decorator". Rename to DAOFilter or EasyDAODecorator or something else.
foam.INTERFACE({
  package: 'foam.dao',
  name: 'DAODecorator',

  methods: [
    {
      name: 'write',
      returns: 'Promise',
      javaReturns: 'foam.core.FObject',
      args: [
        {
          name: 'context'
        },
        {
          name: 'dao'
        },
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        },
        {
          name: 'existing',
          javaType: 'foam.core.FObject'
        }
      ]
    },
    {
      name: 'read',
      returns: 'Promise',
      javaReturns: 'foam.core.FObject',
      args: [
        {
          name: 'context'
        },
        {
          name: 'dao'
        },
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        }
      ]
    },
    {
      name: 'remove',
      returns: 'Promise',
      javaReturns: 'foam.core.FObject',
      args: [
        {
          name: 'context'
        },
        {
          name: 'dao'
        },
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        }
      ]
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'AbstractDAODecorator',
  implements: ['foam.dao.DAODecorator'],

  methods: [
    function write(X, dao, obj, existing) {
      return Promise.resolve(obj);
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
  package: 'foam.dao',
  name: 'CompoundDAODecorator',

  implements: ['foam.dao.DAODecorator'],

  properties: [
    {
      class: 'Array',
      name: 'decorators'
    }
  ],

  methods: [
    function write(X, dao, obj, existing) {
      var i = 0;
      var d = this.decorators;

      return Promise.resolve(obj).then(function a(obj) {
        return d[i] ? d[i++].write(X, dao, obj, existing).then(a) : obj;
      });
    },

    function read(X, dao, obj) {
      var i = 0;
      var d = this.decorators;

      return Promise.resolve(obj).then(function a(obj) {
        return d[i] ? d[i++].read(X, dao, obj).then(a) : obj;
      });
    },

    function remove(X, dao, obj) {
      var i = 0;
      var d = this.decorators;

      return Promise.resolve(obj).then(function a(obj) {
        return d[i] ? d[i++].remove(X, dao, obj).then(a) : obj;
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.dao',
  name: 'DecoratedDAO',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'foam.mlang.sink.Count',
    'foam.mlang.sink.GroupBy'
  ],

  properties: [
    {
//      class: 'FObjectProperty',
//      of: 'foam.dao.DAODecorator',
      name: 'decorator'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      factory: function() { return this.delegate; }
    }
  ],

  methods: [
    {
      name: 'put_',
      code: function(x, obj) {
        // TODO: obj.id can generate garbase, would be
        // slightly faster if DAO.find() could take an object
        // as well.
        var self = this;
        return ( ( ! obj.id ) ? Promise.resolve(null) : this.dao.find_(x, obj.id) ).then(function(existing) {
          return self.decorator.write(x, self.dao, obj, existing);
        }).then(function(obj) {
          return self.delegate.put_(x, obj);
        });
      }
    },

    {
      name: 'remove_',
      code: function(x, obj) {
        var self = this;
        return this.decorator.remove(x, self.dao, obj).then(function(obj) {
          if ( obj ) return self.delegate.remove_(x, obj);
          return Promise.resolve();
        });
      }
    },

    {
      name: 'find_',
      code: function(x, id) {
        var self = this;
        return this.delegate.find_(x, id).then(function(obj) {
          return self.decorator.read(x, self.dao, obj);
        });
      }
    },

    /*
    TODO: works, but is expensive, so shouldn't be used if decorator.read isn't set
    function select_(x, sink, skip, limit, order, predicate) {
      if ( ! sink ) sink = foam.dao.ArraySink.create();
      // No need to decorate if we're just counting.
      if ( this.Count.isInstance(sink) ) {
        return this.delegate.select_(x, sink, skip, limit, order, predicate);
      }

      // TODO: This is too simplistic, fix
      if ( this.GroupBy.isInstance(sink) ) {
        return this.delegate.select_(x, sink, skip, limit, order, predicate);
      }

      var self = this;

      return new Promise(function(resolve, reject) {
        var ps = [];

        self.delegate.select({
          put: function(o) {
            var p = self.decorator.read(x, self.dao, o);
            p.then(function(o) { sink.put(o); })
            ps.push(p);
          },
          eof: function() {
          }
        }, skip, limit, order, predicate).then(function() {
          Promise.all(ps).then(function() {
            resolve(sink);
          });
        })
      });
    }
    */

    // TODO: Select/removeAll support.  How do we do select
    // without breaking MDAO optimizations?
    // {
    //   name: 'select',
    //   code: function() {
    //   }
    // },
    // {
    //   name: 'removeAll',
    //   code: function() {
    //   }
    // }
  ]
});
