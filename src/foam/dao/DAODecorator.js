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
  name: 'CascadingRemoveDecorator',
  implements: [ 'foam.dao.DAODecorator' ],

  mehtods: [
    function read(X, dao, obj) {
    },
    function write(X, dao, obj, existing) {
    },
    function remove(X, dao, obj) {
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
    }
  ],

  methods: [
    {
      name: 'put',
      code: function(obj) {
        var self = this;
        return this.delegate.find(obj.id).then(function(existing) {
          return self.decorator.write(obj, existing);
        }).then(function(newObj) {
          return self.delegate.put(newObj);
        });
      }
    },
    {
      name: 'remove',
      code: function(obj) {
      }
    },
    {
      name: 'find',
      code: function(id) {
        var self = this;
        return this.SUPER(id).then(function(o) {
          return o && self.decorator.read(o);
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
