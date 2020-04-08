/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterHTTPBox',
  extends: 'foam.box.HTTPBox',

  methods: [
    {
      name: 'getReplyBox',
      type: 'foam.box.Box',
      code: function() {
        return this.ClusterHTTPReplyBox.create();
      },
      swiftCode: function() {/*
                               return ClusterHTTPReplyBox_create()
                             */},
      javaCode: `
        return getX().create(foam.nanos.medusa.ClusterHTTPReplyBox.class);
      `
    }
  ]
});
