/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.parser',
  name: 'Optional',
  extends: 'foam.swift.parse.parser.ProxyParser',
  methods: [
    {
      name: 'parse',
      swiftCode: function() {/*
let ret = delegate.parse(ps, x)
if ret != nil { return ret }
return ps?.setValue(nil)
      */},
    },
  ]
});
