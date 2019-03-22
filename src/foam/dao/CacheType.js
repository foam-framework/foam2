/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.dao',
  name: 'CacheType',

  documentation: 'Set CacheType Value on EasyDao',

  values: [
    {
      name: 'NONE',
      documentation: 'NO CacheDAO used',
      label: 'None'
    },
    {
      name: 'FULL',
      documentation: 'Using Regular CacheDAO',
      label: 'Full'
    },
    {
      name: 'LRU',
      documentation: 'Using LRU CacheDAO',
      label: 'LRU'
    }
  ]
});

