foam.CLASS({
  package: 'com.google.foam.demos.iban',
  name: 'IBAN',

  constants: {
    COUNTRIES: (function() {
      var m = {};
      [
        'ALkk bbbs sssx cccc cccc cccc cccc',
        'DEkk bbbb bbbb cccc cccc cc',
        'ESkk bbbb gggg xxcc cccc cccc',
        'FRkk bbbb bggg ggcc cccc cccc cxx',
        'GBkk bbbb ssss sscc cccc cc',
        'GRkk bbbs sssc cccc cccc cccc ccc',
        'HUkk bbbs sssk cccc cccc cccc cccx',
        'IEkk aaaa bbbb bbcc cccc cc',
        'ITkk xaaa aabb bbbc cccc cccc ccc',
        'NLkk bbbb cccc cccc cc',
        'SEkk bbbc cccc cccc cccc cccc'
      ].forEach(function (c) {
        m[c.substring(0,2)] = c.substring(2).replace(/ /g, '');
      });
      return m;
    })()
  },

  methods: [
    function validateChar(format, c) {
      switch ( format ) {
        case 'b': return c >= 'A' && c <= 'Z';
        case 's': return c >= 'A' && c <= 'Z' || c >= 'a' && c <= 'z' || c >= '0' && c <= '9';
        case 'c': return c >= '0' && c <= '9';
      }
      return true;
    },

    function trim(iban) {
      return iban.replace(/ /g, '');
    },

    function format(iban) {
      var l = iban.length;
      for ( var i = l - l % 4 ; i > 0 ; i -= 4 ) iban = iban.substring(0, i) + ' ' + iban.substring(i);
      return iban;
    },

    function validate(iban) {
      iban = this.trim(iban);

      if ( iban.length < 2 ) throw 'IBAN too short';

      var cc = iban.substring(0, 2);
      var format = this.COUNTRIES[cc];

      if ( ! format ) throw 'Unknown country code: ' + cc;

      if ( iban.length != format.length + 2 )
        throw 'IBAN length mismatch for country code. Was expecting ' + (format.length + 2) + ' characters but found ' + iban.length;

      for ( var i = 0 ; i < format.length ; i++ ) {
        if ( ! this.validateChar(format.charAt(i), iban.charAt(i+2)) ) throw 'Invalid character at position ' + (i+2);
      }

      var num = this.toNumber(iban);
      var checksum = this.mod(num, 97);

      if ( checksum != 1 ) throw 'Invalid checksum ' + checksum;
    },

    function setChecksum(iban) {
      iban = iban.substring(0,2) + '00' + iban.substring(4, 200);
      var num = this.toNumber(iban);
      var checksum = this.mod(num, 97);
      var desiredChecksum = 98 - checksum;
      iban = iban.substring(0,2) + ('' + desiredChecksum).padStart(2, '0') + iban.substring(4);
      return iban;
    },

    function toNumber(iban) {
      iban = iban.substring(4) + iban.substring(0, 4);
      for ( var l = iban.length ; l >= 0 ; l-- ) {
        var c = iban.charAt(l);
        if ( c >= 'A' && c <= 'Z' ) {
          iban = iban.substring(0, l) + (10 + ( c.charCodeAt(0) - 'A'.charCodeAt(0) )) + iban.substring(l+1)
        }
      }
      return iban;
    },

    function testIBAN(iban) {
      try {
        console.log('validating: "' + iban + '"');
        this.validate(iban);
        console.log('valid');
      } catch (x) {
        console.log('invalid: ' + x);
      }
      console.log();
    },

    function mod(num, a) {
      /** IBANs may be too long to represent as integers, so implement a string-based mod function. **/
      var ret = 0;

      // One by one process all digits of 'num'
      for ( var i = 0 ; i < num.length ; i++ )
        ret = (ret*10 + (num.charAt(i) - '0')) % a;

      return ret;
    },

    function next(iban) {
      for ( var i = iban.length-1 ; i >= 2 ; i-- ) {
        var c = iban.charAt(i);
        if ( c < '9' ) {
          return this.setChecksum(iban.substring(0, i) + (parseInt(iban.charAt(i)) + 1 + '') + iban.substring(i+1));
        }
        iban = iban.substring(0, i) + '0' + iban.substring(i+1);
      }
    }
  ],

  actions: [
    function test() {
      this.testIBAN('');
      this.testIBAN('??');
      this.testIBAN('GB');
      this.testIBAN('GB29 NWBK 6016 1331 9268 19');
      this.testIBAN('GB29 NWB1 6016 1331 9268 1A');
      this.testIBAN('GB28 NWBK 6016 1331 9268 19');
      this.testIBAN('GB29 NWBK 6016 1331 9268 19');
      this.testIBAN('GB82 WEST 1234 5698 7654 32');
      console.log('GB29 NWBK 6016 1331 9268 19');
      console.log(this.trim('GB29 NWBK 6016 1331 9268 19'));
      console.log(this.format(this.trim('GB29 NWBK 6016 1331 9268 19')));
      console.log(this.format('GB29N'));
      console.log(this.format('GB29NW'));
      console.log(this.format('GB29NWB'));
      console.log(this.format('GB29NWBK'));
      console.log(this.format('GB29NWBK6'));
      console.log(this.format('GB29NWBK60'));
      console.log(this.format('GB29NWBK601'));
      console.log(this.format('GB29NWBK6016'));
      console.log(this.format('GB29NWBK60161'));
      console.log(this.format('GB29NWBK601613'));
      console.log(this.format('GB29NWBK6016133'));
      console.log(this.format('GB29NWBK60161331'));
      console.log(this.format('GB29NWBK601613319'));
      console.log(this.format('GB29NWBK6016133192'));
      console.log(this.format('GB29NWBK60161331926'));
      console.log(this.format('GB29NWBK601613319268'));
      console.log(this.format('GB29NWBK6016133192681'));
      console.log(this.format('GB29NWBK60161331926819'));
      console.log(this.mod('3214282912345698765432161182', 97));
      console.log('GB82 WEST 1234 5698 7654 32');
      console.log(this.toNumber(this.trim('GB82 WEST 1234 5698 7654 32')));
      console.log('3214282912345698765432161182');
      console.log(this.setChecksum('GB99WEST12345698765432'));
      console.log(this.next('GB99WEST12345698765432'));
      var iban = 'GB99WEST12345698765432';
      for ( var i = 0 ; i < 10 ; i++ ) {
        iban = this.next(iban);
        console.log(this.format(iban));
      }
    }
  ]
});
