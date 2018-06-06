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
      swiftReturns: 'FObject?',
      swiftThrows: true,
      args: [
        {
          name: 'obj',
          swiftType: 'FObject'
        }
      ]
    },
    {
      name: 'put_',
      returns: 'Promise',
      swiftReturns: 'FObject?',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          swiftType: 'Context?'
        },
        {
          name: 'obj',
          swiftType: 'FObject'
        }
      ]
    },
    {
      name: 'remove',
      returns: 'Promise',
      swiftReturns: 'FObject?',
      swiftThrows: true,
      args: [
        {
          name: 'obj',
          swiftType: 'FObject'
        }
      ]
    },
    {
      name: 'remove_',
      returns: 'Promise',
      swiftReturns: 'FObject?',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          swiftType: 'Context?'
        },
        {
          name: 'obj',
          swiftType: 'FObject'
        }
      ]
    },
    {
      name: 'find',
      returns: 'Promise',
      swiftReturns: 'FObject?',
      swiftThrows: true,
      args: [
        {
          name: 'id',
          swiftType: 'Any?'
        }
      ],
    },
    {
      name: 'find_',
      returns: 'Promise',
      swiftReturns: 'FObject?',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          swiftType: 'Context?'
        },
        {
          name: 'id',
          swiftType: 'Any?'
        }
      ]
    },
    {
      name: 'select',
      returns: 'Promise',
      swiftReturns: 'Sink',
      swiftThrows: true,
      args: [
        {
          name: 'sink',
          swiftType: 'Sink',
        }
      ]
    },
    {
      name: 'select_',
      returns: 'Promise',
      swiftReturns: 'Sink',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          swiftType: 'Context?'
        },
        {
          name: 'sink',
          swiftType: 'Sink',
          swiftDefaultValue: 'ArraySink()',
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
          swiftType: 'Comparator?',
          swiftDefaultValue: 'nil',
        },
        {
          name: 'predicate',
          swiftType: 'FoamPredicate?',
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
          swiftType: 'Comparator?',
          swiftDefaultValue: 'nil',
        },
        {
          name: 'predicate',
          swiftType: 'FoamPredicate?',
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
          name: 'sink',
          swiftType: 'Sink',
          swiftDefaultValue: 'ArraySink()',
        },
        {
          name: 'predicate',
          swiftType: 'FoamPredicate?',
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
          swiftType: 'Sink',
          swiftDefaultValue: 'ArraySink()',
        },
        {
          name: 'predicate',
          swiftType: 'FoamPredicate?',
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
          swiftType: 'Sink'
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
          swiftType: 'Sink'
        },
        {
          name: 'predicate',
          swiftType: 'FoamPredicate?',
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
          swiftType: 'FoamPredicate?',
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
          swiftType: 'Comparator'
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
      swiftSupport: false,
      returns: 'foam.dao.DAO',
      args: [ 'x' ]
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
