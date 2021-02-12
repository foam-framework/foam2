/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.net',
  name: 'IPSupport',

  documentation: 'IP address helper/support methods',

  javaImports: [
    'javax.servlet.http.HttpServletRequest'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  private final static IPSupport instance__ = new IPSupport();
  public static IPSupport instance() { return instance__; }
          `
        }));
      }
    }
  ],

  methods: [
    {
      // java only
      documentation: 'Retrieve remote IP from http request',
      name: 'getRemoteIp',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'String',
      javaCode: `
      HttpServletRequest req = x.get(HttpServletRequest.class);
      if ( req == null ) {
        return null;
      }
      String forwardedForHeader = req.getHeader("X-Forwarded-For");
      if ( ! foam.util.SafetyUtil.isEmpty(forwardedForHeader) ) {
        String[] addresses = forwardedForHeader.split(",");
        return addresses[addresses.length -1].trim(); // right most
      } else {
        return req.getRemoteHost();
      }
      `
    }
  ]
});
