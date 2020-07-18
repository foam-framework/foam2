foam.CLASS({
  package: 'com.google.foam.demos.iban',
  name: 'IBAN',

  constants: {
    COUNTRIES: (function() {
      var specs = [
      [ "AD", 24, "F04F04A12",          "AD1200012030200359100100" ],
      [ "AE", 23, "F03F16",             "AE070331234567890123456" ],
      [ "AL", 28, "F08A16",             "AL47212110090000000235698741" ],
      [ "AT", 20, "F05F11",             "AT611904300234573201" ],
      [ "AZ", 28, "U04A20",             "AZ21NABZ00000000137010001944" ],
      [ "BA", 20, "F03F03F08F02",       "BA391290079401028494" ],
      [ "BE", 16, "F03F07F02",          "BE68539007547034" ],
      [ "BG", 22, "U04F04F02A08",       "BG80BNBG96611020345678" ],
      [ "BH", 22, "U04A14",             "BH67BMAG00001299123456" ],
      [ "BR", 29, "F08F05F10U01A01",    "BR9700360305000010009795493P1" ],
      [ "BY", 28, "A04F04A16",          "BY13NBRB3600900000002Z00AB00" ],
      [ "CH", 21, "F05A12",             "CH9300762011623852957" ],
      [ "CR", 22, "F04F14",             "CR72012300000171549015" ],
      [ "CY", 28, "F03F05A16",          "CY17002001280000001200527600" ],
      [ "CZ", 24, "F04F06F10",          "CZ6508000000192000145399" ],
      [ "DE", 22, "F08F10",             "DE89370400440532013000" ],
      [ "DK", 18, "F04F09F01",          "DK5000400440116243" ],
      [ "DO", 28, "U04F20",             "DO28BAGR00000001212453611324" ],
      [ "EE", 20, "F02F02F11F01",       "EE382200221020145685" ],
      [ "EG", 29, "F04F04F17",          "EG800002000156789012345180002" ],
      [ "ES", 24, "F04F04F01F01F10",    "ES9121000418450200051332" ],
      [ "FI", 18, "F06F07F01",          "FI2112345600000785" ],
      [ "FO", 18, "F04F09F01",          "FO6264600001631634" ],
      [ "FR", 27, "F05F05A11F02",       "FR1420041010050500013M02606" ],
      [ "GB", 22, "U04F06F08",          "GB29NWBK60161331926819" ],
      [ "GE", 22, "U02F16",             "GE29NB0000000101904917" ],
      [ "GI", 23, "U04A15",             "GI75NWBK000000007099453" ],
      [ "GL", 18, "F04F09F01",          "GL8964710001000206" ],
      [ "GR", 27, "F03F04A16",          "GR1601101250000000012300695" ],
      [ "GT", 28, "A04A20",             "GT82TRAJ01020000001210029690" ],
      [ "HR", 21, "F07F10",             "HR1210010051863000160" ],
      [ "HU", 28, "F03F04F01F15F01",    "HU42117730161111101800000000" ],
      [ "IE", 22, "U04F06F08",          "IE29AIBK93115212345678" ],
      [ "IL", 23, "F03F03F13",          "IL620108000000099999999" ],
      [ "IS", 26, "F04F02F06F10",       "IS140159260076545510730339" ],
      [ "IT", 27, "U01F05F05A12",       "IT60X0542811101000000123456" ],
      [ "IQ", 23, "U04F03A12",          "IQ98NBIQ850123456789012" ],
      [ "JO", 30, "A04F22",             "JO15AAAA1234567890123456789012" ],
      [ "KW", 30, "U04A22",             "KW81CBKU0000000000001234560101" ],
      [ "KZ", 20, "F03A13",             "KZ86125KZT5004100100" ],
      [ "LB", 28, "F04A20",             "LB62099900000001001901229114" ],
      [ "LC", 32, "U04F24",             "LC07HEMM000100010012001200013015" ],
      [ "LI", 21, "F05A12",             "LI21088100002324013AA" ],
      [ "LT", 20, "F05F11",             "LT121000011101001000" ],
      [ "LU", 20, "F03A13",             "LU280019400644750000" ],
      [ "LV", 21, "U04A13",             "LV80BANK0000435195001" ],
      [ "MC", 27, "F05F05A11F02",       "MC5811222000010123456789030" ],
      [ "MD", 24, "U02A18",             "MD24AG000225100013104168" ],
      [ "ME", 22, "F03F13F02",          "ME25505000012345678951" ],
      [ "MK", 19, "F03A10F02",          "MK07250120000058984" ],
      [ "MR", 27, "F05F05F11F02",       "MR1300020001010000123456753" ],
      [ "MT", 31, "U04F05A18",          "MT84MALT011000012345MTLCAST001S" ],
      [ "MU", 30, "U04F02F02F12F03U03", "MU17BOMM0101101030300200000MUR" ],
      [ "NL", 18, "U04F10",             "NL91ABNA0417164300" ],
      [ "NO", 15, "F04F06F01",          "NO9386011117947" ],
      [ "PK", 24, "U04A16",             "PK36SCBL0000001123456702" ],
      [ "PL", 28, "F08F16",             "PL61109010140000071219812874" ],
      [ "PS", 29, "U04A21",             "PS92PALS000000000400123456702" ],
      [ "PT", 25, "F04F04F11F02",       "PT50000201231234567890154" ],
      [ "QA", 29, "U04A21",             "QA30AAAA123456789012345678901" ],
      [ "RO", 24, "U04A16",             "RO49AAAA1B31007593840000" ],
      [ "RS", 22, "F03F13F02",          "RS35260005601001611379" ],
      [ "SA", 24, "F02A18",             "SA0380000000608010167519" ],
      [ "SC", 31, "U04F04F16U03",       "SC18SSCB11010000000000001497USD" ],
      [ "SE", 24, "F03F16F01",          "SE4550000000058398257466" ],
      [ "SI", 19, "F05F08F02",          "SI56263300012039086" ],
      [ "SK", 24, "F04F06F10",          "SK3112000000198742637541" ],
      [ "SM", 27, "U01F05F05A12",       "SM86U0322509800000000270100" ],
      [ "ST", 25, "F08F11F02",          "ST68000100010051845310112" ],
      [ "SV", 28, "U04F20",             "SV62CENR00000000000000700025" ],
      [ "TL", 23, "F03F14F02",          "TL380080012345678910157" ],
      [ "TN", 24, "F02F03F13F02",       "TN5910006035183598478831" ],
      [ "TR", 26, "F05F01A16",          "TR330006100519786457841326" ],
      [ "UA", 29, "F25",                "UA511234567890123456789012345" ],
      [ "VA", 22, "F18",                "VA59001123000012345678" ],
      [ "VG", 24, "U04F16",             "VG96VPVG0000012345678901" ],
      [ "XK", 20, "F04F10F02",          "XK051212012345678906" ],
      // Unofficial IBAN users
      [ "AO", 25, "F21",                "AO69123456789012345678901" ],
      [ "BF", 27, "F23",                "BF2312345678901234567890123" ],
      [ "BI", 16, "F12",                "BI41123456789012" ],
      [ "BJ", 28, "F24",                "BJ39123456789012345678901234" ],
      [ "CI", 28, "U02F22",             "CI70CI1234567890123456789012" ],
      [ "CM", 27, "F23",                "CM9012345678901234567890123" ],
      [ "CV", 25, "F21",                "CV30123456789012345678901" ],
      [ "DZ", 24, "F20",                "DZ8612345678901234567890" ],
      [ "IR", 26, "F22",                "IR861234568790123456789012" ],
      [ "MG", 27, "F23",                "MG1812345678901234567890123" ],
      [ "ML", 28, "U01F23",             "ML15A12345678901234567890123" ],
      [ "MZ", 25, "F21",                "MZ25123456789012345678901" ],
      [ "SN", 28, "U01F23",             "SN52A12345678901234567890123" ],
      // French territories
      [ "GF", 27, "F05F05A11F02",       "GF121234512345123456789AB13" ],
      [ "GP", 27, "F05F05A11F02",       "GP791234512345123456789AB13" ],
      [ "MQ", 27, "F05F05A11F02",       "MQ221234512345123456789AB13" ],
      [ "RE", 27, "F05F05A11F02",       "RE131234512345123456789AB13" ],
      [ "PF", 27, "F05F05A11F02",       "PF281234512345123456789AB13" ],
      [ "TF", 27, "F05F05A11F02",       "TF891234512345123456789AB13" ],
      [ "YT", 27, "F05F05A11F02",       "YT021234512345123456789AB13" ],
      [ "NC", 27, "F05F05A11F02",       "NC551234512345123456789AB13" ],
      [ "BL", 27, "F05F05A11F02",       "BL391234512345123456789AB13" ],
      [ "MF", 27, "F05F05A11F02",       "MF551234512345123456789AB13" ],
      [ "PM", 27, "F05F05A11F02",       "PM071234512345123456789AB13" ],
      [ "WF", 27, "F05F05A11F02",       "WF621234512345123456789AB13" ]
    ];

      var m = {};
      /*
      [
        'ALkk bbbs sssx cccc cccc cccc cccc',
        'DEkk bbbb bbbb cccc cccc cc',
        'ESkk bbbb gggg xxcc cccc cccc',
        'FRkk bbbb bggg ggcc cccc cccc cxx',
        'GBkk bbbb cccc cccc cccc cc',
        'GRkk bbbs sssc cccc cccc cccc ccc',
        'HUkk bbbs sssc cccc cccc cccc cccx',
        'IEkk aaaa bbbb bbcc cccc cc',
        'ITkk xaaa aabb bbbc cccc cccc ccc',
        'NLkk bbbb cccc cccc cc',
        'SEkk bbbc cccc cccc cccc cccc'
      ].forEach(function (c) {
        m[c.substring(0,2)] = c.substring(2).replace(/ /g, '');
      });
      */
      specs.forEach(function(spec) {
        var countryCode = spec[0];
        var format      = spec[2];
        var longFormat  = 'FF';

        var regex = format.match(/(.{3})/g).map(function(segment) {
          // parse each structure block (1-char + 2-digits)
          var pattern = segment.substring(0, 1);
          var repeats = parseInt(segment.substring(1));

          for ( var i = 0 ; i < repeats ; i++ ) longFormat += pattern;
        });
        m[countryCode] = longFormat;
//        console.log(com.google.foam.demos.iban.IBAN.create().format(countryCode + longFormat));

      });

      return m;
    })()
  },

  methods: [
    function validateChar(format, c) {
      switch ( format ) {
        case "A": return c >= 'A' && c <= 'Z' || c >= 'a' && c <= 'z' || c >= '0' && c <= '9';
        case "B": return c >= 'A' && c <= 'Z' || c >= '0' && c <= '9';
        case "C": return c >= 'A' && c <= 'Z' || c >= 'a' && c <= 'z';
        case "F": return c >= '0' && c <= '9';
        case "L": return c >= 'a' && c <= 'z';
        case "U": return c >= 'A' && c <= 'Z';
        case "W": return c >= 'a' && c <= 'z' || c >= '0' && c <= '9';
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

/*
8n,16c ALkk bbbs sssx cccc cccc cccc cccc
8n,12c ADkk bbbb ssss cccc cccc cccc
16n BAkk bbbs sscc cccc ccxx
23n,1a,1c BRkk bbbb bbbb ssss sccc cccc cccc c
4a,14c BHkk bbbb cccc cccc cccc cc
12n BEkk bbbc cccc ccxx
17n HRkk bbbb bbbc cccc cccc c
8n,16c CYkk bbbs ssss cccc cccc cccc cccc
4a,6n,8c BGkk bbbb ssss ddcc cccc cc
17n CRkk bbbc cccc cccc cccc c
4a,20n DOkk bbbb cccc cccc cccc cccc cccc
16n EEkk bbss cccc cccc cccx
20n CZkk bbbb ssss sscc cccc cccc
14n DKkk bbbb cccc cccc cc
10n,11c,2n FRkk bbbb bggg ggcc cccc cccc cxx
2c,16n GEkk bbcc cccc cccc cccc cc
14n FOkk bbbb cccc cccc cx
14n FIkk bbbb bbcc cccc cx
7n,16c GRkk bbbs sssc cccc cccc cccc ccc
14n GLkk bbbb cccc cccc cc
18n DEkk bbbb bbbb cccc cccc cc
4a,15c GIkk bbbb cccc cccc cccc ccc
22n ISkk bbbb sscc cccc iiii iiii ii
4c,14n IEkk aaaa bbbb bbcc cccc cc
19n ILkk bbbn nncc cccc cccc ccc
1a,10n,12c ITkk xaaa aabb bbbc cccc cccc ccc
5n,12c LIkk bbbb bccc cccc cccc c
16n LTkk bbbb bccc cccc cccc
4a,13c LVkk bbbb cccc cccc cccc c
4n,20c LBkk bbbb cccc cccc cccc cccc cccc
4a,5n,18c MTkk bbbb ssss sccc cccc cccc cccc ccc
23n MRkk bbbb bsss sscc cccc cccc cxx
3n,13c LUkk bbbc cccc cccc cccc
3n,10c,2n MKkk bbbc cccc cccc cxx
2c,18n MDkk bbcc cccc cccc cccc cccc
18n MEkk bbbc cccc cccc cccc xx
4a,19n,3a MUkk bbbb bbss cccc cccc cccc cccc cc
10n,11c,2n MCkk bbbb bsss sscc cccc cccc cxx
4c,16n PKkk bbbb cccc cccc cccc cccc
4c,21n PSkk bbbb xxxx xxxx xccc cccc cccc c
4a,10n NLkk bbbb cccc cccc cc
11n NOkk bbbb cccc ccx
4a,16c ROkk bbbb cccc cccc cccc cccc
1a,10n,12c SMkk xaaa aabb bbbc cccc cccc ccc
24n PLkk bbbs sssx cccc cccc cccc cccc
21n PTkk bbbb ssss cccc cccc cccx x
20n SKkk bbbb ssss sscc cccc cccc
15n SIkk bbss sccc cccc cxx
2n,18c SAkk bbcc cccc cccc cccc cccc
18n RSkk bbbc cccc cccc cccc xx
20n ESkk bbbb gggg xxcc cccc cccc
20n SEkk bbbc cccc cccc cccc cccc
5n,17c TRkk bbbb bxcc cccc cccc cccc cc
5n,12c CHkk bbbb bccc cccc cccc c
4a,14n GBkk bbbb ssss sscc cccc cc
3n,16n AEkk bbbc cccc cccc cccc ccc
*/
