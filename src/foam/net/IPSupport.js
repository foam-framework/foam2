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
    'java.net.InetAddress',
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
      }
      return req.getRemoteHost();
      `
    },
    {
      name: 'ip2long',
      args: [
        {
          name: 'ip',
          type: 'String'
        }
      ],
      type: 'Long',
      javaThrows: ['java.net.UnknownHostException'],
      javaCode: `
      InetAddress address = InetAddress.getByName(ip);
      byte[] octets = address.getAddress();
      long result = 0;
      for (byte octet : octets) {
        result <<= 8;
        result |= octet & 0xff;
      }
      return result;
      `
    },
    {
      name: 'long2ip',
      args: [
        {
          documentation: 'decimal representation of ip',
          name: 'ip',
          type: 'Long'
        }
      ],
      type: 'String',
      javaCode: `
      StringBuilder sb = new StringBuilder(15);
      for (int i = 0; i < 4; i++) {
        sb.insert(0,Long.toString(ip & 0xff));
        if (i < 3) {
          sb.insert(0,'.');
        }
        ip = ip >> 8;
      }
      return sb.toString();
      `
    }
  ]
});
