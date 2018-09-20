/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box',
  name: 'AbstractSkeleton',
  implements: [ 'foam.box.Skeleton' ],

  abstract: true,

  methods: [
    {
      name: 'getMessageX',
      documentation: 'Return context stored in message if present, otherwise getX().',
      returns: 'Context',
      args: [ { name: 'msg', type: 'foam.box.Message' } ],
      javaCode: `foam.core.X x = (foam.core.X)msg.getLocalAttributes().get("x");
return x == null ? getX() : x;`
    },
    {
      name: 'tobyte',
      javaReturns: 'byte',
      args: [ { javaType: 'Object', name: 'o' } ],
      javaCode: `return ((Number) o).byteValue();`
    },
    {
      name: 'todouble',
      javaReturns: 'double',
      args: [ { javaType: 'Object', name: 'o' } ],
      javaCode: `return ((Number) o).doubleValue();`
    },
    {
      name: 'tofloat',
      javaReturns: 'float',
      args: [ { javaType: 'Object', name: 'o' } ],
      javaCode: `return ((Number) o).floatValue();`
    },
    {
      name: 'toint',
      javaReturns: 'int',
      args: [ { javaType: 'Object', name: 'o' } ],
      javaCode: `return ((Number) o).intValue();`
    },
    {
      name: 'tolong',
      javaReturns: 'long',
      args: [ { javaType: 'Object', name: 'o' } ],
      javaCode: `return ((Number) o).longValue();`
    },
    {
      name: 'toshort',
      javaReturns: 'short',
      args: [ { javaType: 'Object', name: 'o' } ],
      javaCode: `return ((Number) o).shortValue();`
    }
  ]
});
