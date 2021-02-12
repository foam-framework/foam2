/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.net',
  name: 'IPSupport',

  documentation: 'Support methods for validating IP addresses. Example: Classless Inter-Domain Routing (CIDR) Ranges.',

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
    },
    {
      documentation: 'Validate if HTTP request IP is in CIDR list. Presently only supports v4 IP addresses.',
      name: 'validateCidr',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          documentation: 'List of CIDR ranges',
          name: 'cidrList',
          type: 'List'
        }
      ],
      javaThrows: ['foam.core.ValidationException'],
      javaCode: `
      String remoteIp = getRemoteIp(x);
      ((foam.nanos.logger.Logger) x.get("logger")).debug(this.getClass().getSimpleName(), "validateCidr", "remoteIp", remoteIp);
      if ( remoteIp == null ) {
        return;
      }
      validateIpCidr(x, remoteIp, cidrList);
      `
    },
    {
      documentation: 'Validate if IP is in CIDR list. Presently only supports v4 IP addresses.',
      name: 'validateIpCidr',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          documentation: 'V4 IP ###.###.###.### format',
          name: 'ip',
          type: 'String'
        },
        {
          documentation: 'List of CIDR ranges, in format ###.###.###/##',
          name: 'cidrList',
          type: 'List'
        }
      ],
      javaThrows: ['foam.core.ValidationException'],
      javaCode: `
      if ( cidrList == null ||
           cidrList.size() == 0 ) {
      ((foam.nanos.logger.Logger) x.get("logger")).debug(this.getClass().getSimpleName(), "validateIpCidr", "remoteIp", ip, "list empty");
        return;
      }
      byte[] remote = ip.getBytes();
//      boolean match = false;
      for ( String cidr : (java.util.List<String>)cidrList ) {
        ((foam.nanos.logger.Logger) x.get("logger")).debug(this.getClass().getSimpleName(), "validateIpCidr", "remoteIp", ip, "testing", cidr);
        String[] parts = cidr.split("/");
        String address = parts[0];
        int maskBits = -1;
        if ( parts.length == 1 ) {
          if ( address.equals(ip) ) {
//            match = true;
            return;
          }
          throw new foam.core.ValidationException("Restricted IP");
        }
        maskBits = Integer.parseInt(parts[1]);
        // alarm on < 0 > 32

        byte[] required = address.getBytes();

        int maskFullBytes = maskBits / 8;
        byte finalByte = (byte) (0xFF00 >> (maskBits & 0x07));

        for (int i = 0; i < maskFullBytes; i++) {
          if (remote[i] != required[i]) {
            throw new foam.core.ValidationException("Restricted IP");
          }
        }

        if (finalByte != 0) {
          if ( (remote[maskFullBytes] & finalByte) != (required[maskFullBytes] & finalByte) ) {
            throw new foam.core.ValidationException("Restricted IP");
          }
        }
      }
      ((foam.nanos.logger.Logger) x.get("logger")).debug(this.getClass().getSimpleName(), "validateIpCidr", "remoteIp", ip, "fall through");
      `
    }
  ]
});
