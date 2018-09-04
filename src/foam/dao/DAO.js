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
  name: 'DAO',

  documentation: 'DAO Interface',

  methods: [
    {
      name: 'put',
      returns: 'Promise',
      swiftReturns: 'foam_core_FObject?',
      swiftThrows: true,
      args: [
        {
          of: 'FObject',
          name: 'obj',
        }
      ]
    },
    {
      name: 'put_',
      returns: 'Promise',
      swiftReturns: 'foam_core_FObject?',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          swiftType: 'Context?'
        },
        {
          of: 'FObject',
          name: 'obj',
        }
      ]
    },
    {
      name: 'remove',
      returns: 'Promise',
      swiftReturns: 'foam_core_FObject?',
      swiftThrows: true,
      args: [
        {
          of: 'FObject',
          name: 'obj',
        }
      ]
    },
    {
      name: 'remove_',
      returns: 'Promise',
      swiftReturns: 'foam_core_FObject?',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          swiftType: 'Context?'
        },
        {
          name: 'obj',
          of: 'FObject'
        }
      ]
    },
    {
      name: 'find',
      returns: 'Promise',
      swiftReturns: 'foam_core_FObject?',
      swiftThrows: true,
      args: [
        {
          name: 'id',
        }
      ],
    },
    {
      name: 'find_',
      returns: 'Promise',
      swiftReturns: 'foam_core_FObject?',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          swiftType: 'Context?'
        },
        {
          name: 'id',
        }
      ]
    },
    {
      name: 'select',
      returns: 'Promise',
      swiftReturns: 'foam_dao_Sink',
      swiftThrows: true,
      args: [
        {
          name: 'sink',
          of: 'foam.dao.Sink',
        }
      ]
    },
    {
      name: 'select_',
      returns: 'Promise',
      swiftReturns: 'foam_dao_Sink',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          swiftType: 'Context?'
        },
        {
          name: 'sink',
          of: 'foam.dao.Sink',
          swiftDefaultValue: 'foam_dao_ArraySink()',
        },
        {
          name: 'skip',
          swiftType: 'Int',
          swiftDefaultValue: '0',
        },
        {
          name: 'limit',
          swiftType: 'Int',
          swiftDefaultValue: 'Int.max',
        },
        {
          name: 'order',
          of: 'foam.mlang.order.Comparator',
          optional: true,
          swiftDefaultValue: 'nil',
        },
        {
          name: 'predicate',
          of: 'foam.mlang.predicate.Predicate',
          optional: true,
          swiftDefaultValue: 'nil',
        }
      ]
    },
    {
      name: 'removeAll',
      returns: '',
      swiftThrows: true,
      args: [ ]
    },
    {
      name: 'removeAll_',
      returns: '',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          swiftType: 'Context?'
        },
        {
          name: 'skip',
          swiftType: 'Int?',
          swiftDefaultValue: 'nil',
        },
        {
          name: 'limit',
          swiftType: 'Int?',
          swiftDefaultValue: 'nil',
        },
        {
          name: 'order',
          of: 'foam.mlang.order.Comparator',
          optional: true,
          swiftDefaultValue: 'nil',
        },
        {
          name: 'predicate',
          of: 'foam.mlang.predicate.Predicate',
          optional: true,
          swiftDefaultValue: 'nil',
        }
      ]
    },
    {
      name: 'listen',
      returns: '',
      swiftReturns: 'Detachable',
      swiftThrows: true,
      args: [
        {
          of: 'foam.dao.Sink',
          name: 'sink',
          swiftDefaultValue: 'foam_dao_ArraySink()',
        },
        {
          name: 'predicate',
          of: 'foam.mlang.predicate.Predicate',
          optional: true,
          swiftDefaultValue: 'nil',
        }
      ]
    },
    {
      name: 'listen_',
      returns: '',
      swiftReturns: 'Detachable',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          swiftType: 'Context?'
        },
        {
          name: 'sink',
          of: 'foam.dao.Sink',
          swiftDefaultValue: 'foam_dao_ArraySink()',
        },
        {
          name: 'predicate',
          of: 'foam.mlang.predicate.Predicate',
          optional: true,
          swiftDefaultValue: 'nil',
        }
      ]
    },
    {
      name: 'pipe', // TODO: return a promise? don't put pipe and listen here?
      returns: '',
      swiftThrows: true,
      args: [
        {
          name: 'sink',
          of: 'foam.dao.Sink',
        }
      ],
    },
    {
      name: 'pipe_', // TODO: return a promise? don't put pipe and listen here?
      returns: '',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          swiftType: 'Context?'
        },
        {
          name: 'sink',
          of: 'foam.dao.Sink',
        },
        {
          name: 'predicate',
          of: 'foam.mlang.predicate.Predicate',
          optional: true,
          swiftDefaultValue: 'nil',
        }
      ]
    },
    {
      name: 'where',
      returns: 'foam.dao.DAO',
      swiftThrows: true,
      args: [
        {
          name: 'predicate',
          of: 'foam.mlang.predicate.Predicate',
          optional: true,
          swiftDefaultValue: 'nil',
        }
      ]
    },
    {
      name: 'orderBy',
      returns: 'foam.dao.DAO',
      swiftThrows: true,
      args: [
        {
          name: 'comparator',
          of: 'foam.mlang.order.Comparator',
        }
      ]
    },
    {
      name: 'skip',
      returns: 'foam.dao.DAO',
      swiftThrows: true,
      args: [
        {
          name: 'count',
          swiftType: 'Int'
        }
      ]
    },
    {
      name: 'limit',
      returns: 'foam.dao.DAO',
      swiftThrows: true,
      args: [
        {
          name: 'count',
          swiftType: 'Int'
        }
      ]
    },
    {
      name: 'inX',
      returns: 'foam.dao.DAO',
      args: [ { name: 'x', swiftType: 'Context' } ]
    },
    {
      name: 'cmd',
      swiftSupport: false,
      returns: 'obj',
      args: [ 'obj' ]
    },
    {
      name: 'cmd_',
      swiftSupport: false,
      returns: 'obj',
      args: [ 'x', 'obj' ]
    }
  ]
});
