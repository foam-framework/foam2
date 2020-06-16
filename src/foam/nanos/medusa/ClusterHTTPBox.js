/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterHTTPBox',
  extends: 'foam.box.HTTPBox',

  documentation: 'HTTPBox which only augments the Formatter with a ClusterPropertyPredicate.  All networkTransient properties are sent.  The ClusterHTTPBox is intended for use between two servers exchange data, not client/server.',

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  protected static final ThreadLocal<foam.lib.formatter.FObjectFormatter> formatter_ = new ThreadLocal<foam.lib.formatter.FObjectFormatter>() {
    @Override
    protected foam.lib.formatter.JSONFObjectFormatter initialValue() {
      foam.lib.formatter.JSONFObjectFormatter formatter = new foam.lib.formatter.JSONFObjectFormatter();
      formatter.setQuoteKeys(true);
      formatter.setPropertyPredicate(new foam.lib.ClusterPropertyPredicate());
      return formatter;
    }

    @Override
    public foam.lib.formatter.FObjectFormatter get() {
      foam.lib.formatter.FObjectFormatter formatter = super.get();
      formatter.reset();
      return formatter;
    }
  };
          `
        }));
      }
    }
  ],

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
