/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'StorageOptionalDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Discard DAO updates which result in only storageOptional property changes.`,

  javaImports: [
    'foam.core.FObject',
    'foam.lib.formatter.FObjectFormatter',
    'foam.lib.formatter.JSONFObjectFormatter',
    'foam.util.SafetyUtil'
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
      FObject old = getDelegate().find_(x, obj.getProperty("id"));
      if ( old != null ) {
        FObjectFormatter formatter = formatter_.get();
        formatter.outputDelta(old, obj);
        if ( SafetyUtil.isEmpty(formatter.builder().toString().trim()) ) {
          return obj;
        }
      }
      return getDelegate().put_(x, obj);
      `
    }
  ]
});
