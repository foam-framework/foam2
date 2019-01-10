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
      type: 'Context',
      args: [ { name: 'msg', type: 'foam.box.Message' } ],
      javaCode: `foam.core.X x = (foam.core.X)msg.getLocalAttributes().get("x");
return x == null ? getX() : x;`
    },
    {
      name: 'tobyte',
      javaType: 'byte',
      args: [ { javaType: 'Object', name: 'o' } ],
      javaCode: `return ((Number) o).byteValue();`
    },
    {
      name: 'todouble',
      javaType: 'double',
      args: [ { javaType: 'Object', name: 'o' } ],
      javaCode: `return ((Number) o).doubleValue();`
    },
    {
      name: 'tofloat',
      javaType: 'float',
      args: [ { javaType: 'Object', name: 'o' } ],
      javaCode: `return ((Number) o).floatValue();`
    },
    {
      name: 'toint',
      javaType: 'int',
      args: [ { javaType: 'Object', name: 'o' } ],
      javaCode: `return ((Number) o).intValue();`
    },
    {
      name: 'tolong',
      javaType: 'long',
      args: [ { javaType: 'Object', name: 'o' } ],
      javaCode: `return ((Number) o).longValue();`
    },
    {
      name: 'toshort',
      javaType: 'short',
      args: [ { javaType: 'Object', name: 'o' } ],
      javaCode: `return ((Number) o).shortValue();`
    }
  ]
});
