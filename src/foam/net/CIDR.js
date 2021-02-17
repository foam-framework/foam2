/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.net',
  name: 'CIDR',

  documentation: `Model a Classless Inter-Domain Routing Range.  Used to restrict access to particular IP address range.  So, for example, admin group users can only login when on a company VPN.
@see https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing
List entries are of the form: 172.0.0.0/24 - this would restrict logins to 172.xxx.xxx adresses.`,

  constants: [
    {
      name: 'NOTATION_MIN_LENGTH',
      type: 'Integer',
      value: 10
    },
    {
      name: 'NOTATION_MAX_LENGTH',
      type: 'Integer',
      value: 18
    }
  ],

  properties: [
    {
      documentation: 'CIDR Address and Mask.',
      name: 'notation',
      class: 'String',
      placeholder: '10.0.0.0/24',
      required: true,
      validateObj: function(notation) {
        if ( ! notation ||
             notation.length < this.NOTATION_MIN_LENGTH ||
             notation.length > this.NOTATION_MAX_LENGTH ) {
          return 'invalid notation';
        }
        var m = notation.match(/\d+/g); // 198.162.1.1/24 -> ['198','162','1','1','24']
        if ( ! m || m.length != 5 ) {
          return 'invalid notation';
        }
      },
      // NOTE: use postSet rather than expression: function(notation) to
      // support CIDRs as FObjectArray - which is the most common use case.
      postSet: function(o, n) {
        if ( n &&
                n.length >= this.NOTATION_MIN_LENGTH &&
                n.length <= this.NOTATION_MAX_LENGTH ) {
          this.calculateAddresses(n);
        }
      },
      javaSetter: `
      if ( val != null &&
           val.length() >= NOTATION_MIN_LENGTH &&
           val.length() <= NOTATION_MAX_LENGTH ) {
        try {
          calculateAddresses(val);
        } catch ( java.net.UnknownHostException e ) {
          throw new foam.core.FOAMException(e.getMessage(), e);
        }
      }
      notation_ = val;
      notationIsSet_ = true;
      `
    },
    // NOTE: see postSet above
    // {
    //   flags: ['js'],
    //   name: 'calculate_',
    //   class: 'String',
    //   visibility: 'HIDDEN',
    //   expression: function(notation) {
    //     if ( notation &&
    //             notation.length >= this.NOTATION_MIN_LENGTH &&
    //             notation.length <= this.NOTATION_MAX_LENGTH ) {
    //       this.calculateAddresses(notation);
    //     }
    //     return notation;
    //   }
    // },
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
      name: 'calculateAddresses',
      args: [
        {
          name: 'notation',
          type: 'String'
        }
      ],
      code: function(notation) {
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

        var m = notation.match(/\d+/g); // 198.162.1.1/24 -> ['198','162','1','1','24']
        if ( ! m || m.length < 5 ) {
          console.warn('invalid notation', notation);
          return;
        }
        var addr32 = m.slice(0, 4).reduce(function (a, o) {
          return u(+a << 8) + +o;            // 0xc6a20101
        });
        let mask = u(~0 << (32 - +m[4])); // 0xffffff00
        this.low = u(addr32 & mask);
        this.high = u(addr32 | ~mask);
        this.startAddress = ip(this.low);
        this.endAddress = ip(this.high);
      },
      javaThrows: ['java.net.UnknownHostException'],
      javaCode: `
      String[] tokens = notation.split("/");
      if ( tokens.length < 2 ) {
        throw new foam.core.FOAMException("Invalid CIDR notation");
      }
      long addr32 = IPSupport.instance().ip2long(tokens[0]);
      long mask = Long.parseLong(tokens[1]);
      setLow(addr32 & mask);
      setHigh(addr32 & mask);
      setStartAddress(IPSupport.instance().long2ip(getLow()));
      setEndAddress(IPSupport.instance().long2ip(getHigh()));
      `
    },
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
      long test = IPSupport.instance().ip2long(ip);
      return test >= getLow() &&
             test <= getHigh();
      `
    }
  ]
});
