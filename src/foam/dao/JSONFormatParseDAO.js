/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'JSONFormatParseDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Serialize to JSON and back to FObject to simulate network and storage transfer, to troubleshoot cloning, or lack of cloning issue, and also inline updates to Arrays.`,

  javaImports: [
    'foam.core.FObject',
    'foam.lib.formatter.FObjectFormatter',
    'foam.lib.formatter.JSONFObjectFormatter',
    'foam.lib.json.JSONParser',
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  protected static final ThreadLocal<FObjectFormatter> formatter_ = new ThreadLocal<FObjectFormatter>() {
    @Override
    protected JSONFObjectFormatter initialValue() {
      JSONFObjectFormatter formatter = new JSONFObjectFormatter();
      formatter.setOutputDefaultValues(false);
      formatter.setOutputReadableDates(false);
      formatter.setPropertyPredicate(new foam.lib.StoragePropertyPredicate());
      return formatter;
    }

    @Override
    public FObjectFormatter get() {
      FObjectFormatter formatter = super.get();
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
      name: 'put_',
      javaCode: `
      Class cls = obj.getClass();
      FObjectFormatter formatter = formatter_.get();
      formatter.output(obj);
      String data = formatter.builder().toString();
      FObject nu = x.create(JSONParser.class).parseString(data, obj.getClass());
      return getDelegate().put_(x, nu);
      `
    }
  ]
});
