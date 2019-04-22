/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.dao',
  name: 'CacheType',

  documentation: 'Set CacheType Value on EasyDao',

  values: [
    {
      name: 'NONE',
      documentation: 'No caching',
      label: 'None'
    },
    {
      name: 'FULL',
      documentation: 'Using full caching',
      label: 'Full'
    },
    {
      name: 'LRU',
      documentation: 'Using a LRU (Least Recently Used) partial cache'
    }
  ]
});

