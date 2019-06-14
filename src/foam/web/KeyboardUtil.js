/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.LIB({
  name: 'foam.web.KeyboardUtil',

  documentation: 'A utility library to make it easier to work with keyboard events.',

  constants: {
    CONVERSION_TABLE: {
      8: 'Backspace',
      9: 'Tab',
      13: 'Enter',
      16: 'Shift',
      17: 'Control',
      18: 'Alt',
      20: 'CapsLock',
      27: 'Escape',
      32: ' ',
      37: 'ArrowLeft',
      38: 'ArrowUp',
      39: 'ArrowRight',
      40: 'ArrowDown',
      43: '+',
      48: '0',
      49: '1',
      50: '2',
      51: '3',
      52: '4',
      53: '5',
      54: '6',
      55: '7',
      56: '8',
      57: '9',
      65: 'a',
      66: 'b',
      67: 'c',
      68: 'd',
      69: 'e',
      70: 'f',
      71: 'g',
      72: 'h',
      73: 'i',
      74: 'j',
      75: 'k',
      76: 'l',
      77: 'm',
      78: 'n',
      79: 'o',
      80: 'p',
      81: 'q',
      82: 'r',
      83: 's',
      84: 't',
      85: 'u',
      86: 'v',
      87: 'w',
      88: 'x',
      89: 'y',
      90: 'z',
      91: 'Meta',
      186: ';',
      187: '=',
      188: ',',
      189: '-',
      190: '.',
      191: '/',
      192: '`',
      219: '[',
      220: '\\',
      221: ']',
      222: "'",
    },
    // When the shift key is held, we need a different table to look up the
    // value in.
    SHIFT_CONVERSION_TABLE: {
      8: 'Backspace',
      9: 'Tab',
      13: 'Enter',
      16: 'Shift',
      17: 'Control',
      18: 'Alt',
      20: 'CapsLock',
      27: 'Escape',
      32: ' ',
      37: 'ArrowLeft',
      38: 'ArrowUp',
      39: 'ArrowRight',
      40: 'ArrowDown',
      48: ')',
      49: '!',
      50: '@',
      51: '#',
      52: '$',
      53: '%',
      54: '^',
      55: '&',
      56: '*',
      57: '(',
      65: 'A',
      66: 'B',
      67: 'C',
      68: 'D',
      69: 'E',
      70: 'F',
      71: 'G',
      72: 'H',
      73: 'I',
      74: 'J',
      75: 'K',
      76: 'L',
      77: 'M',
      78: 'N',
      79: 'O',
      80: 'P',
      81: 'Q',
      82: 'R',
      83: 'S',
      84: 'T',
      85: 'U',
      86: 'V',
      87: 'W',
      88: 'X',
      89: 'Y',
      90: 'Z',
      91: 'Meta',
      186: ':',
      187: '+',
      188: '<',
      189: '_',
      190: '>',
      191: '?',
      192: '~',
      219: '{',
      220: '|',
      221: '}',
      222: '"',
    },
    // Older browsers return non-standard values. In those cases, we convert
    // to the standard values.
    NORMALIZATION_TABLE: {
      'Spacebar': ' ',
      'Left': 'ArrowLeft',
      'Up': 'ArrowUp',
      'Right': 'ArrowRight',
      'Down': 'ArrowDown',
      'Esc': 'Escape',
    }
  },

  methods: [
    function getKey(keyboardEvent) {
      /**
       * Returns a string that represents the key pressed.
       *
       * WARNING: Only works for `keydown` or `keyup` events if the browser does
       * not support `KeyboardEvent.key`. All major browsers at the time of
       * writing do support that property. For the older browsers that don't,
       * we fall back to `KeyboardEvent.which` and `KeyboardEvent.keyCode`. In
       * those cases we use a lookup table to return what `KeyboardEvent.key`
       * would have returned. We also handle a few browser quirks where browsers
       * do support `KeyboardEvent.key` but return a non-standard value. The
       * reason we don't support `keypress` though is because that event sets
       * different values for `KeyboardEvent.which` and `KeyboardEvent.keyCode`
       * than `keydown` and `keyup` do. So in it's current state, this method
       * doesn't support `keypress` events on browsers that don't support
       * `KeyboardEvent.key`.
       */

      var key = keyboardEvent.key;

      if ( key ) {
        if ( this.NORMALIZATION_TABLE.hasOwnProperty(key) ) {
          return this.NORMALIZATION_TABLE[key];
        }

        return key;
      }

      var val = keyboardEvent.which || keyboardEvent.keyCode;

      if ( keyboardEvent.getModifierState('Shift') ) {
        if ( this.SHIFT_CONVERSION_TABLE.hasOwnProperty(val) ) {
          return this.SHIFT_CONVERSION_TABLE[val];
        }
      } else {
        if ( this.CONVERSION_TABLE.hasOwnProperty(val) ) {
          return this.CONVERSION_TABLE[val];
        }
      }

      console.warn('Unrecognized keyboard key code: ' + val);
      return 'Unknown';
    }
  ]
});
