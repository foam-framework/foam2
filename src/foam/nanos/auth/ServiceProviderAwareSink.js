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

  constants: [
    {
      name: 'SYSTEM_SPID',
      value: '*',
      type: 'String'
    }
  ],

  properties: [
    {
      name: 'spid',
      class: 'String',
      value: 'nanos'
    },
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public ServiceProviderAwareSink(foam.core.X x, foam.dao.Sink delegate) {
    setX(x);
    setDelegate(delegate);
    User user = (User) x.get("user");
    if ( user.getId() == User.SYSTEM_USER_ID ) {
      setSpid(SYSTEM_SPID);
    } else {
      setSpid(user.getSpid());
    }
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
    if ( obj instanceof ServiceProviderAware ) {
      ServiceProviderAware sp = (ServiceProviderAware) obj;
      if ( foam.util.SafetyUtil.isEmpty(sp.getSpid()) ||
           ! sp.getSpid().equals(getSpid()) &&
           ! SYSTEM_SPID.equals(getSpid()) ) {
        return;
      }
    }
    getDelegate().put(obj, sub);
      `
    },
    {
      name: 'remove',
      javaCode: `
    if ( obj instanceof ServiceProviderAware ) {
      ServiceProviderAware sp = (ServiceProviderAware) obj;
      if ( foam.util.SafetyUtil.isEmpty(sp.getSpid()) ||
           ! sp.getSpid().equals(getSpid()) &&
           ! SYSTEM_SPID.equals(getSpid()) ) {
       return;
      }
    }
    getDelegate().remove(obj, sub);
      `
    }
  ]
});

