/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'ReadOnlyDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: 'DAO decorator that throws errors on put and remove.',
  methods: [
    {
      name: 'put_',
      javaCode: `throw new UnsupportedOperationException("Cannot put into ReadOnlyDAO");`
    },
    {
      name: 'remove_',
      javaCode: `throw new UnsupportedOperationException("Cannot remove from ReadOnlyDAO");`
    },
    {
      name: 'removeAll_',
      javaCode: `throw new UnsupportedOperationException("Cannot removeAll from ReadOnlyDAO");`
    }
  ]
});
