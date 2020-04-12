/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterHTTPBox',
  extends: 'foam.box.HTTPBox',

  documentation: 'HTTPBox which only augments the Outputter with a ClusterPropertyPredicate.  All networkTransient properties are sent.  The ClusterHTTPBox is intended for use between two servers exchange data, not client/server.',

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
protected class Outputter extends foam.lib.json.Outputter {
  public Outputter(foam.core.X x) {
    super(x);
    setPropertyPredicate(new foam.lib.ClusterPropertyPredicate());
  }

  protected void outputFObject(foam.core.FObject o) {
    if ( o == getMe() ) {
      o = getX().create(foam.nanos.medusa.ClusterHTTPReplyBox.class);
    }
    super.outputFObject(o);
  }
}
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
