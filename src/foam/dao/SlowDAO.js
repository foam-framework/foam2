/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'SlowDAO',
  extends: 'foam.dao.ProxyDAO',
  properties: [
    {
      class: 'Int',
      name: 'delayMs',
    },
  ],
  methods: [
    {
      name: 'select_',
      swiftCode: `
usleep(UInt32(delayMs * 1000))
return try super.select_(x, sink, skip, limit, order, predicate)
      `,
      javaCode: `
try {
  Thread.sleep(getDelayMs());
} catch(InterruptedException e) {
}

return super.select_(x, sink, skip, limit, order, predicate);
      `,
    },
    {
      name: 'put_',
      swiftCode: `
usleep(UInt32(delayMs * 1000))
return try super.put_(x, obj)
      `,
      javaCode: `
try {
  Thread.sleep(getDelayMs());
} catch(InterruptedException e) {
}

return super.put_(x, obj);
      `,
    },
    {
      name: 'remove_',
      swiftCode: `
usleep(UInt32(delayMs * 1000))
return try super.remove_(x, obj)
      `,
      javaCode: `
try {
  Thread.sleep(getDelayMs());
} catch(InterruptedException e) {
}

return super.remove_(x, obj);
      `,
    },
    {
      name: 'removeAll_',
      swiftCode: `
usleep(UInt32(delayMs * 1000))
return try super.removeAll_(x)
      `,
      javaCode: `
try {
  Thread.sleep(getDelayMs());
} catch(InterruptedException e) {
}

super.removeAll_(x, skip, limit, order, predicate);
      `,
    },
    {
      name: 'find_',
      swiftCode: `
usleep(UInt32(delayMs * 1000))
return try super.find_(x, id)
      `,
    },
  ]
});
