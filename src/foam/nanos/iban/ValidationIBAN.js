/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.iban',
  name: 'ValidationIBAN',

  javaImports: [
    'foam.core.ValidationException',
    'foam.nanos.iban.IBANInfo',
    'foam.util.SafetyUtil'
  ],

  constants: [
    {
      documentation: `See https://en.wikipedia.org/wiki/International_Bank_Account_Number
Columns: validation format, parsing format, example`,
      name: 'COUNTRIES',
      factory: function() {
        var m = {};

        [
          ["ADFF FFFF FFFF AAAA AAAA AAAA", "", "AD12 0001 2030 2003 5910 0100"],
          ["AEFF FFFF FFFF FFFF FFFF FFF", "", "AE07 0331 2345 6789 0123 456"],
          ["ALFF FFFF FFFF AAAA AAAA AAAA AAAA", "", "AL47 2121 1009 0000 0002 3569 8741"],
          ["ATFF FFFF FFFF FFFF FFFF", "ATkk bbbb bccc cccc cccc", "AT61 1904 3002 3457 3201"],
          ["AZFF UUUU AAAA AAAA AAAA AAAA AAAA", "", "AZ21 NABZ 0000 0000 1370 1000 1944"],
          ["BAFF FFFF FFFF FFFF FFFF", "", "BA39 1290 0794 0102 8494"],
          ["BEFF FFFF FFFF FFFF", "BEkk bbbc cccc ccxx", "BE68 5390 0754 7034"],
          ["BGFF UUUU FFFF FFAA AAAA AA", "", "BG80 BNBG 9661 1020 3456 78"],
          ["BHFF UUUU AAAA AAAA AAAA AA", "", "BH67 BMAG 0000 1299 1234 56"],
          ["BRFF FFFF FFFF FFFF FFFF FFFF FFFU A", "BRkk bbbb bbbb ssss sccc cccc ccct n", "BR97 0036 0305 0000 1000 9795 493P 1"],
          ["BYFF AAAA FFFF AAAA AAAA AAAA AAAA", "", "BY13 NBRB 3600 9000 0000 2Z00 AB00"],
          ["CHFF FFFF FAAA AAAA AAAA A", "", "CH93 0076 2011 6238 5295 7"],
          ["CRFF FFFF FFFF FFFF FFFF FF", "", "CR72 0123 0000 0171 5490 15"],
          ["CYFF FFFF FFFF AAAA AAAA AAAA AAAA", "CYkk bbbs ssss cccc cccc cccc cccc", "CY17 0020 0128 0000 0012 0052 7600"],
          ["CZFF FFFF FFFF FFFF FFFF FFFF", "", "CZ65 0800 0000 1920 0014 5399"],
          ["DEFF FFFF FFFF FFFF FFFF FF", "DEkk ssss ssss cccc cccc cc", "DE89 3704 0044 0532 0130 00"],
          ["DKFF FFFF FFFF FFFF FF", "", "DK50 0040 0440 1162 43"],
          ["DOFF UUUU FFFF FFFF FFFF FFFF FFFF", "", "DO28 BAGR 0000 0001 2124 5361 1324"],
          ["EEFF FFFF FFFF FFFF FFFF", "EEkk bbss cccc cccc cccx", "EE38 2200 2210 2014 5685"], // Estonia, check digit is appended to the accountNumber
          ["EGFF FFFF FFFF FFFF FFFF FFFF FFFF F", "", "EG80 0002 0001 5678 9012 3451 8000 2"],
          ["ESFF FFFF FFFF FFFF FFFF FFFF", "ESkk bbbb ssss xccc cccc cccc", "ES91 2100 0418 4502 0005 1332"], // Spain, the first check digit goes to branch the second goes to accountNumber
          ["FIFF FFFF FFFF FFFF FF", "FIkk ssss sscc cccc cx", "FI21 1234 5600 0007 85"],
          ["FOFF FFFF FFFF FFFF FF", "", "FO62 6460 0001 6316 34"],
          ["FRFF FFFF FFFF FFAA AAAA AAAA AFF", "FRkk bbbb bsss sscc cccc cccc cxx", "FR14 2004 1010 0505 0001 3M02 606"],
          ["GBFF UUUU FFFF FFFF FFFF FF", "GBkk bbbb ssss sscc cccc cc", "GB29 NWBK 6016 1331 9268 19"],
          ["GEFF UUFF FFFF FFFF FFFF FF", "", "GE29 NB00 0000 0101 9049 17"],
          ["GIFF UUUU AAAA AAAA AAAA AAA", "", "GI75 NWBK 0000 0000 7099 453"],
          ["GLFF FFFF FFFF FFFF FF", "", "GL89 6471 0001 0002 06"],
          ["GRFF FFFF FFFA AAAA AAAA AAAA AAA", "GRkk bbbs sssc cccc cccc cccc ccc", "GR16 0110 1250 0000 0001 2300 695"],
          ["GTFF AAAA AAAA AAAA AAAA AAAA AAAA", "", "GT82 TRAJ 0102 0000 0012 1002 9690"],
          ["HRFF FFFF FFFF FFFF FFFF F", "", "HR12 1001 0051 8630 0016 0"],
          ["HUFF FFFF FFFF FFFF FFFF FFFF FFFF", "", "HU42 1177 3016 1111 1018 0000 0000"],
          ["IEFF UUUU FFFF FFFF FFFF FF", "IEkk bbbb ssss sscc cccc cc", "IE29 AIBK 9311 5212 3456 78"],
          ["ILFF FFFF FFFF FFFF FFFF FFF", "", "IL62 0108 0000 0009 9999 999"],
          ["ISFF FFFF FFFF FFFF FFFF FFFF FF", "", "IS14 0159 2600 7654 5510 7303 39"],
          ["ITFF UFFF FFFF FFFA AAAA AAAA AAA", "ITkk xbbb bbss sssc cccc cccc ccc", "IT60 X054 2811 1010 0000 0123 456"], // Italy, don't include the check digit to the Iban checksum
          ["IQFF UUUU FFFA AAAA AAAA AAA", "", "IQ98 NBIQ 8501 2345 6789 012"],
          ["JOFF AAAA FFFF FFFF FFFF FFFF FFFF FF", "", "JO15 AAAA 1234 5678 9012 3456 7890 12"],
          ["KWFF UUUU AAAA AAAA AAAA AAAA AAAA AA", "", "KW81 CBKU 0000 0000 0000 1234 5601 01"],
          ["KZFF FFFA AAAA AAAA AAAA", "", "KZ86 125K ZT50 0410 0100"],
          ["LBFF FFFF AAAA AAAA AAAA AAAA AAAA", "", "LB62 0999 0000 0001 0019 0122 9114"],
          ["LCFF UUUU FFFF FFFF FFFF FFFF FFFF FFFF", "", "LC07 HEMM 0001 0001 0012 0012 0001 3015"],
          ["LIFF FFFF FAAA AAAA AAAA A", "", "LI21 0881 0000 2324 013A A"],
          ["LTFF FFFF FFFF FFFF FFFF", "LTkk bbbb bccc cccc cccc", "LT12 1000 0111 0100 1000"],
          ["LUFF FFFA AAAA AAAA AAAA", "LUkk bbbc cccc cccc cccc", "LU28 0019 4006 4475 0000"],
          ["LVFF UUUU AAAA AAAA AAAA A", "LVkk bbbb cccc cccc cccc c", "LV80 BANK 0000 4351 9500 1"],
          ["MCFF FFFF FFFF FFAA AAAA AAAA AFF", "", "MC58 1122 2000 0101 2345 6789 030"],
          ["MDFF UUAA AAAA AAAA AAAA AAAA", "", "MD24 AG00 0225 1000 1310 4168"],
          ["MEFF FFFF FFFF FFFF FFFF FF", "", "ME25 5050 0001 2345 6789 51"],
          ["MKFF FFFA AAAA AAAA AFF", "", "MK07 2501 2000 0058 984"],
          ["MRFF FFFF FFFF FFFF FFFF FFFF FFF", "", "MR13 0002 0001 0100 0012 3456 753"],
          ["MTFF UUUU FFFF FAAA AAAA AAAA AAAA AAA", "MTkk bbbb ssss sccc cccc cccc cccc ccc", "MT84 MALT 0110 0001 2345 MTLC AST0 01S"],
          ["MUFF UUUU FFFF FFFF FFFF FFFF FFFU UU", "", "MU17 BOMM 0101 1010 3030 0200 000M UR"],
          ["NLFF UUUU FFFF FFFF FF", "NLkk bbbb cccc cccc cc", "NL91 ABNA 0417 1643 00"],
          ["NOFF FFFF FFFF FFF", "", "NO93 8601 1117 947"],
          ["PKFF UUUU AAAA AAAA AAAA AAAA", "", "PK36 SCBL 0000 0011 2345 6702"],
          ["PLFF FFFF FFFF FFFF FFFF FFFF FFFF", "", "PL61 1090 1014 0000 0712 1981 2874"],
          ["PSFF UUUU AAAA AAAA AAAA AAAA AAAA A", "", "PS92 PALS 0000 0000 0400 1234 5670 2"],
          ["PTFF FFFF FFFF FFFF FFFF FFFF F", "PTkk bbbb ssss cccc cccc cccx x", "PT50 0002 0123 1234 5678 9015 4"], // Portugal, check digits are appended to the accountNumber
          ["QAFF UUUU AAAA AAAA AAAA AAAA AAAA A", "", "QA30 AAAA 1234 5678 9012 3456 7890 1"],
          ["ROFF UUUU AAAA AAAA AAAA AAAA", "", "RO49 AAAA 1B31 0075 9384 0000"],
          ["RSFF FFFF FFFF FFFF FFFF FF", "RSkk bbbc cccc cccc cccc xx", "RS35 2600 0560 1001 6113 79"], // Serbia, check digits are appended to the accountNumber
          ["SAFF FFAA AAAA AAAA AAAA AAAA", "", "SA03 8000 0000 6080 1016 7519"],
          ["SCFF UUUU FFFF FFFF FFFF FFFF FFFF UUU", "", "SC18 SSCB 1101 0000 0000 0000 1497 USD"],
          ["SEFF FFFF FFFF FFFF FFFF FFFF", "SEkk bbbc cccc cccc cccc cccc", "SE45 5000 0000 0583 9825 7466"],
          ["SIFF FFFF FFFF FFFF FFF", "SIkk bbss sccc cccc cxx", "SI56 2633 0001 2039 086"], // Slovenia, check digits are appended to the accountNumber
          ["SKFF FFFF FFFF FFFF FFFF FFFF", "SKkk bbbb ssss sscc cccc cccc", "SK31 1200 0000 1987 4263 7541"],
          ["SMFF UFFF FFFF FFFA AAAA AAAA AAA", "", "SM86 U032 2509 8000 0000 0270 100"],
          ["STFF FFFF FFFF FFFF FFFF FFFF F", "", "ST68 0001 0001 0051 8453 1011 2"],
          ["SVFF UUUU FFFF FFFF FFFF FFFF FFFF", "", "SV62 CENR 0000 0000 0000 0070 0025"],
          ["TLFF FFFF FFFF FFFF FFFF FFF", "", "TL38 0080 0123 4567 8910 157"],
          ["TNFF FFFF FFFF FFFF FFFF FFFF", "", "TN59 1000 6035 1835 9847 8831"],
          ["TRFF FFFF FFAA AAAA AAAA AAAA AA", "", "TR33 0006 1005 1978 6457 8413 26"],
          ["UAFF FFFF FFFF FFFF FFFF FFFF FFFF F", "", "UA51 1234 5678 9012 3456 7890 1234 5"],
          ["VAFF FFFF FFFF FFFF FFFF FF", "", "VA59 0011 2300 0012 3456 78"],
          ["VGFF UUUU FFFF FFFF FFFF FFFF", "", "VG96 VPVG 0000 0123 4567 8901"],
          ["XKFF FFFF FFFF FFFF FFFF", "", "XK05 1212 0123 4567 8906"],
          ["AOFF FFFF FFFF FFFF FFFF FFFF F", "", "AO69 1234 5678 9012 3456 7890 1"],
          ["BFFF FFFF FFFF FFFF FFFF FFFF FFF", "", "BF23 1234 5678 9012 3456 7890 123"],
          ["BIFF FFFF FFFF FFFF", "", "BI41 1234 5678 9012"],
          ["BJFF FFFF FFFF FFFF FFFF FFFF FFFF", "", "BJ39 1234 5678 9012 3456 7890 1234"],
          ["CIFF UUFF FFFF FFFF FFFF FFFF FFFF", "", "CI70 CI12 3456 7890 1234 5678 9012"],
          ["CMFF FFFF FFFF FFFF FFFF FFFF FFF", "", "CM90 1234 5678 9012 3456 7890 123"],
          ["CVFF FFFF FFFF FFFF FFFF FFFF F", "", "CV30 1234 5678 9012 3456 7890 1"],
          ["DZFF FFFF FFFF FFFF FFFF FFFF", "", "DZ86 1234 5678 9012 3456 7890"],
          ["IRFF FFFF FFFF FFFF FFFF FFFF FF", "", "IR86 1234 5687 9012 3456 7890 12"],
          ["MGFF FFFF FFFF FFFF FFFF FFFF FFF", "", "MG18 1234 5678 9012 3456 7890 123"],
          ["MLFF UFFF FFFF FFFF FFFF FFFF FFFF", "", "ML15 A123 4567 8901 2345 6789 0123"],
          ["MZFF FFFF FFFF FFFF FFFF FFFF F", "", "MZ25 1234 5678 9012 3456 7890 1"],
          ["SNFF UFFF FFFF FFFF FFFF FFFF FFFF", "", "SN52 A123 4567 8901 2345 6789 0123"],
          ["GFFF FFFF FFFF FFAA AAAA AAAA AFF", "", "GF12 1234 5123 4512 3456 789A B13"],
          ["GPFF FFFF FFFF FFAA AAAA AAAA AFF", "", "GP79 1234 5123 4512 3456 789A B13"],
          ["MQFF FFFF FFFF FFAA AAAA AAAA AFF", "", "MQ22 1234 5123 4512 3456 789A B13"],
          ["REFF FFFF FFFF FFAA AAAA AAAA AFF", "", "RE13 1234 5123 4512 3456 789A B13"],
          ["PFFF FFFF FFFF FFAA AAAA AAAA AFF", "", "PF28 1234 5123 4512 3456 789A B13"],
          ["TFFF FFFF FFFF FFAA AAAA AAAA AFF", "", "TF89 1234 5123 4512 3456 789A B13"],
          ["YTFF FFFF FFFF FFAA AAAA AAAA AFF", "", "YT02 1234 5123 4512 3456 789A B13"],
          ["NCFF FFFF FFFF FFAA AAAA AAAA AFF", "", "NC55 1234 5123 4512 3456 789A B13"],
          ["BLFF FFFF FFFF FFAA AAAA AAAA AFF", "", "BL39 1234 5123 4512 3456 789A B13"],
          ["MFFF FFFF FFFF FFAA AAAA AAAA AFF", "", "MF55 1234 5123 4512 3456 789A B13"],
          ["PMFF FFFF FFFF FFAA AAAA AAAA AFF", "", "PM07 1234 5123 4512 3456 789A B13"],
          ["WFFF FFFF FFFF FFAA AAAA AAAA AFF", "", "WF62 1234 5123 4512 3456 789A B13"]
          /*
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
          */
        ].forEach(function (c) {
          var format = c[0];
          m[format.substring(0,2)] = [format.substring(2).replace(/ /g, ''), c[1], c[2]];
        });

        return m;
      },
      javaType: 'java.util.Map'
    },
    {
      name: 'MIN_IBAN_LENGTH',
      type: 'int',
      value: 20
    }
  ],

  messages: [
    { name: 'IBAN_REQUIRED',        message: 'IBAN required' },
    { name: 'UNKNOWN_COUNTRY_CODE', message: 'Unknown country code' },
    { name: 'LENGTH_MISMATCHED_1',  message: 'IBAN length mismatch for country code. Was expecting' },
    { name: 'LENGTH_MISMATCHED_2',  message: 'characters but found' },
    { name: 'INVALID_CHARACTER',    message: 'Invalid character at position' },
    { name: 'INVALID_CHECKSUM',     message: 'Invalid IBAN checksum' }
  ],

  methods: [
    {
      name: 'validateChar',
      type: 'boolean',
      args: [
        {
          name: 'format',
          type: 'char'
        },
        {
          name: 'c',
          type: 'char'
        }
      ],
      code: function(format, c) {
        switch ( format ) {
          case 'A': return c >= 'A' && c <= 'Z' || c >= 'a' && c <= 'z' || c >= '0' && c <= '9';
          case 'B': return c >= 'A' && c <= 'Z' || c >= '0' && c <= '9';
          case 'C': return c >= 'A' && c <= 'Z' || c >= 'a' && c <= 'z';
          case 'F': return c >= '0' && c <= '9';
          case 'L': return c >= 'a' && c <= 'z';
          case 'U': return c >= 'A' && c <= 'Z';
          case 'W': return c >= 'a' && c <= 'z' || c >= '0' && c <= '9';
        }
        return true;
      },
      javaCode: `
        switch ( format ) {
          case 'A': return c >= 'A' && c <= 'Z' || c >= 'a' && c <= 'z' || c >= '0' && c <= '9';
            case 'B': return c >= 'A' && c <= 'Z' || c >= '0' && c <= '9';
            case 'C': return c >= 'A' && c <= 'Z' || c >= 'a' && c <= 'z';
            case 'F': return c >= '0' && c <= '9';
            case 'L': return c >= 'a' && c <= 'z';
            case 'U': return c >= 'A' && c <= 'Z';
            case 'W': return c >= 'a' && c <= 'z' || c >= '0' && c <= '9';
        }
        return true;
      `
    },
    {
      name: 'trim',
      type: 'String',
      args: [
        {
          name: 'iban',
          type: 'String'
        }
      ],
      code: function(iban) {
        return iban.replace(/ /g, '');
      },
      javaCode: `
        return iban.replaceAll(" ", "");
      `
    },
    {
      name: 'format',
      type: 'String',
      args: [
        {
          name: 'iban',
          type: 'String'
        }
      ],
      code: function(iban) {
        var l = iban.length;
        for ( let i = l - l % 4 ; i > 0 ; i -= 4 ) iban = iban.substring(0, i) + ' ' + iban.substring(i);
        return iban;
      },
      javaCode: `
        int l = iban.length();
        for ( int i = l - l % 4 ; i > 0 ; i -= 4 ) iban = iban.substring(0, i) + ' ' + iban.substring(i);
        return iban;
      `
    },
    {
      name: 'getFormatForCountry',
      type: 'String',
      args: [
        {
          name: 'cc',
          type: 'String'
        }
      ],
      code:  function(cc) {
        var cInfo = this.COUNTRIES[cc];
        return cInfo && cInfo[0];
      },
      javaCode: `
        Object[] cInfo = (Object[]) COUNTRIES.get(cc);
        if ( cInfo != null ) return (String) cInfo[0];
        return null;
      `
    },
    {
      name: 'validate',
      type: 'Void',
      args: [
        {
          name: 'iban',
          type: 'String'
        }
      ],
      code: function(iban) {
        if ( ! iban || iban.length < this.MIN_IBAN_LENGTH ) return `${this.IBAN_REQUIRED}`;
        iban = this.trim(iban);

        let cc = iban.substring(0, 2);
        let format = this.getFormatForCountry(cc);

        if ( ! format ) return `${this.UNKNOWN_COUNTRY_CODE} ${cc}`;

        if ( iban.length != format.length + 2 )
          return `${this.LENGTH_MISMATCHED_1} ${(format.length + 2)} ${this.LENGTH_MISMATCHED_2} ${iban.length}`;

        for ( let i = 0 ; i < format.length ; i++ ) {
          if ( ! this.validateChar(format.charAt(i), iban.charAt(i+2)) ) return `${this.INVALID_CHARACTER}  ${(i+2)}`;
        }

        let num = this.toNumber(iban);
        let checksum = this.mod(num, 97);

        if ( checksum != 1 ) return this.INVALID_CHECKSUM;

        return 'passed';
      },
      javaCode: `
        if ( foam.util.SafetyUtil.isEmpty(iban) ||
             iban.length() < MIN_IBAN_LENGTH ) {
          throw new ValidationException(IBAN_REQUIRED);
        }
        iban = trim(iban);

        String cc = iban.substring(0, 2);
        String format = getFormatForCountry(cc);

        if ( format == null ) throw new ValidationException(UNKNOWN_COUNTRY_CODE + cc);

        if ( iban.length() != format.length() + 2 )
          throw new ValidationException(
            String.format("%s %d %s %d",
              LENGTH_MISMATCHED_1, format.length() + 2, LENGTH_MISMATCHED_2, iban.length()));

        for ( int i = 0 ; i < format.length() ; i++ ) {
          if ( ! validateChar(format.charAt(i), iban.charAt(i+2) )) throw new ValidationException(INVALID_CHARACTER + (i+2));
        }

        String num = toNumber(iban);
        int checksum = mod(num, 97);

        if ( checksum != 1 ) throw new ValidationException(INVALID_CHECKSUM);
      `
    },
    {
      name: 'setChecksum',
      type: 'String',
      args: [
        {
          name: 'iban',
          type: 'String'
        }
      ],
      code: function(iban) {
        iban = iban.substring(0,2) + '00' + iban.substring(4, 200);
        let num             = this.toNumber(iban);
        let checksum        = this.mod(num, 97);
        let desiredChecksum = 98 - checksum;
        iban = iban.substring(0,2) + ('' + desiredChecksum).padStart(2, '0') + iban.substring(4);
        return iban;
      },
      javaCode: `
        iban = iban.substring(0,2) + "00" + iban.substring(4, 200);
        String num = toNumber(iban);
        int checksum = mod(num, 97);
        int desiredChecksum = 98 - checksum;
        iban = iban.substring(0,2) + ("" + String.format("%2s", "" + desiredChecksum).replace(' ', '0') + iban.substring(4));
        return iban;
      `
    },
    {
      name: 'toNumber',
      type: 'String',
      args: [
        {
          name: 'iban',
          type: 'String'
        }
      ],
      code: function(iban) {
        iban = iban.substring(4) + iban.substring(0, 4);
        let c = "";
        for ( let l = iban.length - 1; l >= 0 ; l-- ) {
          c = iban.charAt(l);
          if ( c >= 'A' && c <= 'Z' ) {
            iban = iban.substring(0, l) + (10 + ( c.charCodeAt(0) - 'A'.charCodeAt(0) )) + iban.substring(l+1);
          }
        }
        return iban;
      },
      javaCode: `
        iban = iban.substring(4) + iban.substring(0, 4);
        for ( int l = iban.length() - 1 ; l >= 0 ; l--) {
          char c = iban.charAt(l);
          if ( c >= 'A' && c <= 'Z' ) {
           iban = iban.substring(0, l) + (10 + (Character.codePointAt(Character.toString(c), 0) - Character.codePointAt(Character.toString('A'), 0))) + iban.substring(l+1);
          }
        }
        return iban;
      `
    },
    {
      name: 'mod',
      type: 'Integer',
      args: [
        {
          name: 'num',
          type: 'String'
        },
        {
          name: 'a',
          type: 'int'
        }
      ],
      code: function(num, a) {
        /** IBANs may be too long to represent as integers, so implement a string-based mod function. **/
        let ret = 0;

        // One by one process all digits of 'num'
        for ( let i = 0 ; i < num.length ; i++ )
          ret = (ret * 10 + (num.charAt(i) - '0')) % a;

        return ret;
      },
      javaCode: `
        int ret = 0;

        for ( int i = 0 ; i < num.length() ; i++ ) {
          ret = (ret * 10 + (num.charAt(i) - '0')) % a;
        }

        return ret;
      `
    },
    {
      name: 'next',
      type: 'String',
      args: [
        {
          name: 'iban',
          type: 'String'
        }
      ],
      code: function(iban) {
        for ( let i = iban.length-1 ; i >= 2 ; i-- ) {
          let c = iban.charAt(i);
          if ( c < '9' ) {
            return this.setChecksum(iban.substring(0, i) + (parseInt(iban.charAt(i)) + 1 + '') + iban.substring(i+1));
          }
          iban = iban.substring(0, i) + '0' + iban.substring(i+1);
        }
      },
      javaCode: `
        for ( int i = iban.length() - 1 ; i >= 2 ; i-- ){
          char c = iban.charAt(i);
          if ( c < '9' ) {
            return setChecksum(iban.substring(0, i) + (Integer.parseInt("" + iban.charAt(i)) + 1 + "") + iban.substring(i+1));
          }
          iban = iban.substring(0, i) + '0' + iban.substring(i+1);
        }
        return null;
      `
    },
    {
      name: 'parse',
      type: 'IBANInfo',
      args: [
       {
          name: 'iban',
          type: 'String'
        }
      ],
      javaCode: `
        if ( foam.util.SafetyUtil.isEmpty(iban) || iban.length() < 20 ) {
          return null;
        }
        iban = iban.replaceAll(" ", "").trim();
        IBANInfo ibanInfo = new IBANInfo();
        ibanInfo.setCountry(iban.substring(0,2));
        Object[] temp = (Object[]) COUNTRIES.get(ibanInfo.getCountry());

        if ( temp == null || temp[1] == null || SafetyUtil.isEmpty((String)temp[1]) ) {
          foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) getX().get("logger");
          if ( logger == null ) {
            logger = new foam.nanos.logger.StdoutLogger();
          }
          logger.warning(this.getClass().getSimpleName(), "parse", "Format not found", ibanInfo.getCountry());
          return null;
        }

        char[] format = ((String) temp[1]).replaceAll(" ","").trim().toCharArray();
        if ( iban.length() != format.length ) {
          return null;
        }

        StringBuilder previous           = null;
        StringBuilder bankCode           = new StringBuilder();
        StringBuilder branch             = new StringBuilder();
        StringBuilder accountNumber      = new StringBuilder();
        StringBuilder ibanChecksum       = new StringBuilder();
        StringBuilder accountType        = new StringBuilder();
        StringBuilder ownerAccountNumber = new StringBuilder();

        // TODO: flag mismatch of character type in parse format.

        for ( int i = 2 ; i < format.length ; i ++ ) {
          if ( i >= iban.length() ) break;
          char next = iban.charAt(i);

          switch ( format[i] ) {
            case ' ':
              break;
            case 'b': // BIC
              bankCode.append(next);
              previous = bankCode;
              break;
            case 'c': // account number
              accountNumber.append(next);
              previous = accountNumber;
              break;
            case 'i': // personal identifier - Iceland
              accountNumber.append(next);
              previous = accountNumber;
              break;
            case 'k': // iban checksum
              ibanChecksum.append(next);
              break;
            case 'm': // currency code
              accountNumber.append(next);
              break;
            case 'n': // owner account - Brazil
              ownerAccountNumber.append(next);
              break;
            case 's': // branch
              branch.append(next);
              previous = branch;
              break;
            case 't': // account type
              accountType.append(next);
              break;
            case 'x': // add to previous
              if ( previous != null )
                previous.append(next);

              break;
            case '0': // Zero
              previous.append('0');
              if ( Character.compare('0', next) != 0 ) {
                foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) getX().get("logger");
                if ( logger == null ) {
                  logger = new foam.nanos.logger.StdoutLogger();
                }
                logger.warning(this.getClass().getSimpleName(), "parse", "symbol mismatch", format, i, format[i], next);
              }
              break;
            default:
              foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) getX().get("logger");
              if ( logger == null ) {
                logger = new foam.nanos.logger.StdoutLogger();
              }
              logger.warning(this.getClass().getSimpleName(), "parse", "unexpected symbol", format, i, format[i]);
          }
        }

        ibanInfo.setIbanChecksum(ibanChecksum.toString());
        ibanInfo.setBankCode(bankCode.toString());
        ibanInfo.setBranch(branch.toString());
        ibanInfo.setAccountNumber(accountNumber.toString());
        ibanInfo.setAccountType(accountType.toString());
        ibanInfo.setOwnerAccountNumber(ownerAccountNumber.toString());
        return ibanInfo;
      `
    }
  ]
});
