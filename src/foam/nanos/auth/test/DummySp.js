/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.test',
  name: 'DummySp',

  documentation: 'A fake/mock/dummy model just to test ServiceProvideAware',

  implements: [
    'foam.nanos.auth.ServiceProviderAware'
  ],

  javaImports: [
    'foam.nanos.auth.ServiceProviderAware',
    'foam.nanos.auth.ServiceProviderAwareSupport'
  ],

  properties: [
    {
      name: 'id',
      class: 'Long'
    },
    {
      name: 'owner',
      class: 'Reference',
      of: 'foam.nanos.auth.User'
    },
    {
      name: 'spid',
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      storageTransient: true,
      javaFactory: `
        var map = foam.util.Arrays.asMap(new Object[]
          {
            DummySp.class.getName(),
            new foam.core.PropertyInfo[] { DummySp.OWNER }
          });
        return new ServiceProviderAwareSupport().findSpid(getX(), map, this);
      `
    }
  ]
});
