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

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.dao.DAODecorator',
      name: 'decorator'
    },
    {
      name: 'dao'
    }
  ],

  methods: [
    {
      name: 'put',
      code: function(obj) {
        // TODO: obj.id can generate garbase, would be
        // slightly faster if DAO.find() could take an object
        // as well.
        var self = this;
        return ( ( ! obj.id ) ? Promise.resolve(null) : this.dao.find(obj.id) ).then(function(existing) {
          return self.decorator.write(self.__context__, self.dao, obj, existing);
        }).then(function(obj) {
          return self.delegate.put(obj);
        });
      }
    },
    {
      name: 'remove',
      code: function(obj) {
        var self = this;
        return this.decorator.remove(self.__context__, self.dao, self.obj).then(function(obj) {
          self.delegate.remove(obj);
        });
      }
    },
    {
      name: 'find',
      code: function(id) {
        var self = this;
        return this.delegate.find(id).then(function(obj) {
          return self.decorator.read(self.__context__, self.dao, obj);
        });
      }
    }
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
