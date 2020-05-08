/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ServiceProviderAwareSink',
  extends: 'foam.dao.ProxySink',

  documentation: 'Sink which discard non-matching spids.',

  javaImports: [
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.dao.Sink',
    'java.util.Map',
    'java.util.HashMap'
  ],
  
  properties: [
    {
      name: 'propertyInfos',
      class: 'Map',
      javaFactory: 'return new java.util.HashMap<String, PropertyInfo[]>();'
    },
    {
      name: 'support',
      class: 'Object',
      of: 'foam.nanos.auth.ServiceProviderAwareSupport',
      visibility: 'HIDDEN',
      javaType: 'foam.nanos.auth.ServiceProviderAwareSupport',
      javaFactory: 'return new ServiceProviderAwareSupport();'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public ServiceProviderAwareSink(X x, Sink delegate, Map<String, PropertyInfo[]> propertyInfos) {
    setX(x);
    setDelegate(delegate);
    setPropertyInfos(propertyInfos);
  }
          `
        }));
      }
    }
  ],

  methods: [
    {
      name: 'put',
      javaCode: `
    if ( getSupport().match(getX(), getPropertyInfos(), obj) ) {
      getDelegate().put(obj, sub);
    }
      `
    },
    {
      name: 'remove',
      javaCode: `
    if ( getSupport().match(getX(), getPropertyInfos(), obj) ) {
      getDelegate().remove(obj, sub);
    }
      `
    }
  ]
});

