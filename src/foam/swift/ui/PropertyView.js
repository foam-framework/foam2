/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.swift.ui',
  name: 'PropertyView',
  methods: [
    {
      name: 'fromProperty',
      args: [
        {
          swiftType: 'PropertyInfo',
          name: 'prop',
        }
      ]
    }
  ]
});
