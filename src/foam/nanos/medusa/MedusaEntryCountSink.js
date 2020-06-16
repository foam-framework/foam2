/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntryCountSink',
  extends: 'foam.dao.AbstractSink',

  javaImports: [
    'foam.nanos.logger.Logger'
  ],

  properties: [
    {
      name: 'counts',
      class: 'Map',
      javaFactory: 'return new HashMap();'
    }
  ],

  methods: [
    {
      name: 'put',
      args: [
        {
          name: 'obj',
          type: 'Object'
        },
        {
          name: 'sub',
          type: 'foam.core.Detachable'
        }
      ],
      javaCode: `
      Map<String, Integer> counts = getCounts();
      MedusaEntry entry = (MedusaEntry) obj;
      Integer count = counts.get(entry.getMyHash());
      if ( count == null ) {
       count = new Integer(0);
      }
      count += 1;
      counts.put(entry.getMyHash(), count);
      `
    },
    {
      // avoid null pointer on ProxySink.eof()
      name: 'eof',
      javaCode: `//nop`
    }
  ]
});
