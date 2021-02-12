/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.net',
  name: 'CIDR',

  documentation: `Model a Classless Inter-Domain Routing Range. See IPSupport for validating an IP against a list of CIDRs.  Used to restrict access to particular IP address range.
@see https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing
List entries are of the form: 172.0.0.0/24 - this would restrict logins to 172.xxx.xxx adresses.`,

  javaImports: [
    'java.net.InetAddress'
  ],

  properties: [
    {
      documentation: 'CIDR Address and Mask.',
      name: 'notation',
      class: 'String',
      placeholder: '10.0.0.0/24'
    },
    {
      name: 'calculate',
      visibility: 'HIDDEN',
      expression: function(notation) {
        // https://stackoverflow.com/a/33003795
        function u(n) {
          return n >>> 0; // unsigned
        };
        function ip(n) {
          return [
            (n >>> 24) & 0xFF,
            (n >>> 16) & 0xFF,
            (n >>>  8) & 0xFF,
            (n >>>  0) & 0xFF
          ].join('.');
        };

        var m = notation.match(/\d+/g); // [ '198', '162', '1', '1', '24' ]
        if ( ! m || m.length < 5 ) {
          console.warn('invalid notation', notation);
          return;
        }
        var addr32 = m.slice(0, 4).reduce(function (a, o) {
          return u(+a << 8) + +o;
        });                           // 0xc6a20101
        let mask = u(~0 << (32 - +m[4])); // 0xffffff00
        this.low = u(addr32 & mask);
        this.high = u(addr32 | ~mask);
        this.startAddress = ip(this.low);
        this.endAddress = ip(this.high);
      }
    },
    {
      documentation: 'Not used in inRange calculations. Calculated for Human inspection.',
      name: 'startAddress',
      class: 'String',
      visibility: 'RO'
    },
    {
      documentation: 'Not used in inRange calculations. Calculated for Human inspection.',
      name: 'endAddress',
      class: 'String',
      visibility: 'RO'
    },
    {
      documentation: 'precalculated and saved to speed inRange tests',
      name: 'high',
      class: 'Long',
      visibility: 'HIDDEN'
    },
    {
      documentation: 'precalculated and saved to speed inRange tests',
      name: 'low',
      class: 'Long',
      visibility: 'HIDDEN'
    }
  ],

  methods: [
    {
      name: 'inRange',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'ip',
          type: 'String'
        }
      ],
      type: 'Boolean',
      javaThrows: ['java.net.UnknownHostException'],
      javaCode: `
      long low = getLow();
      if ( low == 0 ) {
        low = ip2Long(getStartAddress());
        setLow(low);
      }
      long high = getHigh();
      if ( high == 0 ) {
        high = ip2Long(getEndAddress());
        setHigh(high);
      }
      long test = ip2Long(ip);

      return test >= low &&
             test <= high;
      `
    },
    {
      name: 'ip2Long',
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
    }

  ]
});
