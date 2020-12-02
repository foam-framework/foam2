/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PMAuthService',
  extends: 'foam.nanos.auth.ProxyAuthService',

  implements: [
    'foam.nanos.auth.EnabledAware'
  ],

  requires: [
    'foam.nanos.pm.PM'
  ],

  javaImports: [
    'foam.core.X',
    'foam.mlang.order.Comparator',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.pm.PM'
  ],

  properties: [
    {
      name: 'enabled',
      class: 'Boolean',
      value: true
    },
    {
      name: 'classType',
      class: 'Class',
      javaFactory: `
        return PMAuthService.getOwnClassInfo();
      `,
      hidden: true
    },
    {
      name: 'label',
      class: 'String'
    }
  ],

  methods: [
    // Methods specific to PM
    {
      name: 'createPM',
      args: [
        {
          name: 'x',
          type: 'X'
        },
        {
          name: 'op',
          type: 'String'
        }
      ],
      javaType: 'PM',
      javaCode: `
    PM pm = null;
    if ( getEnabled() ) {
      pm = (PM) x.get("PM");
      pm.setKey(this.getClassType().getId());
      pm.setName(op);
      pm.init_();
    }
    return pm;
      `
    },
    {
      name: 'log',
      args: [
        {
          name: 'x',
          type: 'X',
        },
        {
          name: 'pm',
          type: 'PM'
        }
      ],
      javaCode: `
    if ( pm != null ) {
      pm.log(x);
    }
      `
    },
    {
      name: 'getNameFor',
      args: [
        {
          name: 'name',
          type: 'String'
        }
      ],
      type: 'String',
      javaCode: `
        String label = getLabel();
        return "auth" +
          ("".equals(label) ? "" : "/" + label) +
          ":" + name;
      `
    },

    // Proxy methods, to be monitored
    {
      name: 'login',
      javaCode: `
      PM pm = createPM(x, getNameFor("login"));
      try {
        return super.login(x, identifier, password);
      } finally {
        log(x, pm);
      }
     `
    },
    {
      name: 'validatePassword',
      javaCode: `
      PM pm = createPM(x, getNameFor("validatePassword"));
      try {
        super.validatePassword(x, user, potentialPassword);
      } finally {
        log(x, pm);
      }
     `
    },
    {
      name: 'checkUser',
      javaCode: `
      PM pm = createPM(x, getNameFor("checkUser"));
      try {
        return super.checkUser(x, user, permission);
      } finally {
        log(x, pm);
      }
     `
    },
    {
      name: 'check',
      javaCode: `
      PM pm = createPM(x, getNameFor("check"));
      try {
        return super.check(x, permission);
      } finally {
        log(x, pm);
      }
     `
    },
    {
      name: 'updatePassword',
      javaCode: `
      PM pm = createPM(x, getNameFor("updatePassword"));
      try {
        return super.updatePassword(x, oldPassword, newPassword);
      } finally {
        log(x, pm);
      }
     `
    },
    {
      name: 'validateUser',
      javaCode: `
      PM pm = createPM(x, getNameFor("validateUser"));
      try {
        super.validateUser(x, user);
      } finally {
        log(x, pm);
      }
     `
    },
    {
      name: 'logout',
      javaCode: `
      PM pm = createPM(x, getNameFor("logout"));
      try {
        super.logout(x);
      } finally {
        log(x, pm);
      }
     `
    },
  ]
});
