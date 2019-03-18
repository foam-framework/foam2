/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.parser',
  name: 'Substring',
  extends: 'foam.swift.parse.parser.ProxyParser',
  methods: [
    {
      name: 'parse',
      swiftCode: function() {/*
let start = ps!
let ps = super.parse(ps, x)
if ps != nil {
  return ps!.setValue(start.substring(ps!))
}
return ps
      */},
    },
  ]
});

