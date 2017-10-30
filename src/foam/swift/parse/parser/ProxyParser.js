/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.parser',
  // TODO: We should be able to auto generate all of this.
  name: 'ProxyParser',
  implements: ['foam.swift.parse.parser.Parser'],
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.swift.parse.parser.Parser',
      required: true,
      name: 'delegate',
    },
  ],
  methods: [
    {
      name: 'parse',
      swiftCode: function() {/*
return delegate.parse(ps, x)
      */},
    },
  ]
});
