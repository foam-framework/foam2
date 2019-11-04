/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.core',
  name: 'Currency',
  extends: 'foam.core.Unit',

  documentation: `The base model for storing, using and managing currency information.`,

  javaImports: [
    'foam.util.SafetyUtil'
  ],

  tableColumns: [
    'name',
    'id',
    'country',
    'symbol',
    'emoji'
  ],

  properties: [
    {
      class: 'Long',
      name: 'numericCode',
      documentation: 'The numeric code associated with a type of currency.',
      required: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      documentation: `The name of the country associated with the currency.
        This should be set by the child class.`,
      name: 'country',
      required: true
    },
    {
      class: 'String',
      name: 'delimiter',
      documentation: 'The character used to delimit groups of 3 digits.',
      required: true
    },
    {
      class: 'String',
      name: 'decimalCharacter',
      documentation: 'The character used as a decimal.',
      required: true
    },
    {
      class: 'String',
      name: 'symbol',
      documentation: 'The symbol used for the type of currency. Eg: $ for CAD.',
      required: true
    },
    {
      class: 'String',
      name: 'leftOrRight',
      documentation: `The side of the digits that the symbol should be displayed on.`,
      required: true,
      validateObj: function(leftOrRight) {
        if ( leftOrRight !== 'left' && leftOrRight !== 'right' ) return `Property 'leftOrRight' must be set to either "left" or "right".`;
      }
    },
    {
      class: 'String',
      name: 'flagImage',
      documentation: `The flag image used in relation to currencies from countries currently
        supported by the platform.`,
    },
    {
      class: 'String',
      name: 'colour',
      value: '#406dea',
      documentation: `The colour that represents this currency`
    },
    {
      class: 'String',
      name: 'emoji',
      value: '💰'
    },
    {
      class: 'Boolean',
      name: 'showSpace',
      documentation: `Determines whether there is a space between the symbol and
        the number when the currency is displayed.
      `,
      required: true
    }
  ],

  methods: [
    {
      name: 'toSummary',
      documentation: `When using a reference to the currencyDAO, the labels associated
        to it will show a chosen property rather than the first alphabetical string
        property. In this case, we are using the id.
      `,
      code: function(x) {
        return this.id;
      }
    },
    {
      name: 'format',
      code: function(amount) {
        /**
         * Given a number, display it as a currency using the appropriate
         * precision, decimal character, delimiter, symbol, and placement
         * thereof.
         * 
         * With the new home denomination feature, we will append (if left) or 
         * prepend (if right) the alphabetic code if the currency's alphabetic code
         * is not equal to the homeDenomination 
         * 
         */
        amount = Math.floor(amount);
        var isNegative = amount < 0;
        amount = amount.toString();
        if ( isNegative ) amount = amount.substring(1);
        while ( amount.length < this.precision ) amount = '0' + amount;
        var beforeDecimal = amount.substring(0, amount.length - this.precision);
        var formatted = isNegative ? '-' : '';

        if ( this.leftOrRight === 'right' ) {
          formatted += this.id;
          formatted += ' ';
        }

        if ( this.leftOrRight === 'left' ) {
          formatted += this.symbol;
          if ( this.showSpace ) formatted += ' ';
        }
        formatted += beforeDecimal.replace(/\B(?=(\d{3})+(?!\d))/g, this.delimiter) || '0';
        if ( this.precision > 0 ) {
          formatted += this.decimalCharacter;
          formatted += amount.substring(amount.length - this.precision);
        }
        if ( this.leftOrRight === 'right' ) {
          if ( this.showSpace ) formatted += ' ';
          formatted += this.symbol;
        }

        if ( this.leftOrRight === 'left' ) {
          formatted += ' ';
          formatted += this.id;
        }

        return formatted;
      },
      args: [
        {
          class: 'foam.core.UnitValue',
          name: 'amount'
        }
      ],
      type: 'String',
      javaCode: `
        Boolean isNegative = amount < 0;
        String amountStr = Long.toString(amount);
        if ( isNegative ) amountStr = amountStr.substring(1);
        while ( amountStr.length() < this.getPrecision() ) {
          amountStr = "0" + amountStr;
        }
        String beforeDecimal = amountStr.substring(0, amountStr.length() - this.getPrecision());
        String formatted = isNegative ? "-" : "";


        if ( SafetyUtil.equals(this.getLeftOrRight(), "left") ) {
          formatted += this.getSymbol();
          if ( this.getShowSpace() ) {
            formatted += " ";
          }
        }

        formatted += beforeDecimal.length() > 0 ?
          beforeDecimal.replaceAll("\\\\B(?=(\\\\d{3})+(?!\\\\d))", this.getDelimiter()) :
          "0";

        if ( this.getPrecision() > 0 ) {
          formatted += this.getDecimalCharacter();
          formatted += amountStr.substring(amountStr.length() - this.getPrecision());
        }

        if ( SafetyUtil.equals(this.getLeftOrRight(), "right") ) {
          if ( this.getShowSpace() ) {
            formatted += " ";
          }
          formatted += this.getSymbol();
        }


        return formatted;
      `
    }
  ]
});
