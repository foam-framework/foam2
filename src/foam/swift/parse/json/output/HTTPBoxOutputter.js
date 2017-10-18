/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.json.output',
  name: 'HTTPBoxOutputter',
  extends: 'foam.swift.parse.json.output.Outputter',
  requires: [
    'foam.box.HTTPReplyBox',
  ],
  imports: [
    'me',
  ],
  methods: [
    {
      name: 'output',
      swiftCode: function() {/*
super.output(&out, (me as AnyObject) === (data as AnyObject) ?
    HTTPReplyBox_create() : data)
      */},
    },
  ]
});
