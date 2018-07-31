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
  refines: 'foam.dao.DAO',
  flags: ['java'],

  methods: [
    {
      name: 'getOf',
      javaReturns: 'foam.core.ClassInfo'
    },
    {
      name: 'put',
      javaReturns: 'foam.core.FObject',
      args: [
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        }
      ]
    },
    {
      name: 'put_',
      javaReturns: 'foam.core.FObject',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        }
      ]
    },
    {
      name: 'remove',
      javaReturns: 'foam.core.FObject',
      args: [
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        }
      ]
    },
    {
      name: 'remove_',
      javaReturns: 'foam.core.FObject',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        }
      ]
    },
    {
      name: 'find',
      javaReturns: 'foam.core.FObject',
      args: [
        {
          name: 'id',
          javaType: 'Object'
        }
      ]
    },
    {
      name: 'find_',
      javaReturns: 'foam.core.FObject',
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
      name: 'select',
      javaReturns: 'foam.dao.Sink',
      args: [
        {
          name: 'sink',
          javaType: 'foam.dao.Sink'
        }
      ]
    },
    {
      name: 'select_',
      javaReturns: 'foam.dao.Sink',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'sink',
          javaType: 'foam.dao.Sink'
        },
        {
          name: 'skip',
          javaType: 'long'
        },
        {
          name: 'limit',
          javaType: 'long'
        },
        {
          name: 'order',
          javaType: 'foam.mlang.order.Comparator'
        },
        {
          name: 'predicate',
          javaType: 'foam.mlang.predicate.Predicate'
        }
      ]
    },
    {
      name: 'removeAll',
      javaReturns: 'void',
      args: [ ]
    },
    {
      name: 'removeAll_',
      javaReturns: 'void',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'skip',
          javaType: 'long'
        },
        {
          name: 'limit',
          javaType: 'long'
        },
        {
          name: 'order',
          javaType: 'foam.mlang.order.Comparator'
        },
        {
          name: 'predicate',
          javaType: 'foam.mlang.predicate.Predicate'
        }
      ]
    },
    {
      name: 'listen',
      javaReturns: 'void',
      args: [
        {
          name: 'sink',
          javaType: 'foam.dao.Sink'
        },
        {
          name: 'predicate',
          javaType: 'foam.mlang.predicate.Predicate'
        }
      ]
    },
    {
      name: 'listen_',
      javaReturns: 'void',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'sink',
          javaType: 'foam.dao.Sink'
        },
        {
          name: 'predicate',
          javaType: 'foam.mlang.predicate.Predicate'
        }
      ]
    },
    {
      name: 'pipe', // TODO: return a promise? don't put pipe and listen here?
      javaReturns: 'void',
      args: [
        {
          name: 'sink',
          javaType: 'foam.dao.Sink'
        }
      ]
    },
    {
      name: 'pipe_', // TODO: return a promise? don't put pipe and listen here?
      javaReturns: 'void',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'sink',
          javaType: 'foam.dao.Sink'
        }
      ]
    },
    {
      name: 'where',
      javaReturns: 'foam.dao.DAO',
      args: [
        {
          name: 'predicate',
          javaType: 'foam.mlang.predicate.Predicate'
        }
      ]
    },
    {
      name: 'orderBy',
      javaReturns: 'foam.dao.DAO',
      args: [
        {
          name: 'comparator',
          javaType: 'foam.mlang.order.Comparator'
        }
      ]
    },
    {
      name: 'skip',
      javaReturns: 'foam.dao.DAO',
      args: [
        {
          name: 'count',
          javaType: 'long'
        }
      ]
    },
    {
      name: 'limit',
      javaReturns: 'foam.dao.DAO',
      args: [
        {
          name: 'count',
          javaType: 'long'
        }
      ]
    },
    {
      name: 'inX',
      javaReturns: 'foam.dao.DAO',
      args: [
        {
          name: 'x',
          javaType:  'foam.core.X'
        }
      ]
    },
    {
      name: 'cmd',
      javaReturns: 'Object',
      args: [
        {
          name: 'obj',
          javaType:  'Object'
        }
      ]
    },
    {
      name: 'cmd_',
      javaReturns: 'Object',
      args: [
        {
          name: 'x',
          javaType:  'foam.core.X'
        },
        {
          name: 'obj',
          javaType:  'Object'
        }
      ]
    }
  ]
});
