/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box.socket',
  name: 'DemoSocketClientReplyBox',
  implements: [
    'foam.box.Box'
  ],

  javaImports: [
    'foam.lib.json.Outputter',
    'foam.lib.NetworkPropertyPredicate'
  ],

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
      formatter.setPropertyPredicate(new foam.lib.AndPropertyPredicate(new foam.lib.PropertyPredicate[] {new foam.lib.NetworkPropertyPredicate(), new foam.lib.PermissionedPropertyPredicate()}));
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
      name: 'send',
      javaCode: `
        System.out.println("---Socket Reply----");
        foam.lib.formatter.FObjectFormatter formatter = formatter_.get();
        formatter.setX(getX());
        formatter.output(msg);
        String message = formatter.builder().toString();
        System.out.println(message);
      `
    }
  ]
});

