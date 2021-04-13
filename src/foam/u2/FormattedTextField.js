/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'FormattedTextField',
  extends: 'foam.u2.View',

  css: `
    ^ {
      display: flex;
      position: relative;
      width: fit-content;
      flex-direction: column;
      justify-content: center;
    }
    ^placeholder::after {
      position: absolute;
      left: 9px;
      content: attr(data-placeholder);
      pointer-events: none;
      opacity: 0.7;
      font-size: 14px;
      letter-spacing: normal;
    }
  `,

  properties: [
    {
      class: 'Array',
      name: 'formatter',
      documentation: `
        Array of integers and strings of delimiters used to format the input
        where integer values represent number of digits at its location
        e.g., [3, '.', 3, '.', 3, '-', 2] 
      `
    },
    // Use a new prop as input data in case the actual data shouldn't include formatting
    'formattedData',
    {
      name: 'placeholder',
      factory: function() {
        return this.formatter.join('').replace(/\d+/g, function(match) { return '#'.repeat(match); });
      }
    },
    {
      name: 'dynamicPlaceholder',
      expression: function(placeholder, formattedData) {
        return formattedData + placeholder.substring(formattedData.length);
      },
      documentation: 'The placeholder text when the input has content'
    },
    // booleans to configure state for formatting data
    'isDelete',
    'includeTrailingDelimiter',
    'formatted'
  ],

  methods: [
    function initE() {
      this.resetState();
      this.formattedData$.sub(this.formatData);
      this.formattedData = this.data || '';

      var input = foam.u2.TextField.create({ onKey: true, data$: this.formattedData$ });
      input.setAttribute('maxlength', this.placeholder.length);

      return this
          .setAttribute('data-placeholder', this.dynamicPlaceholder$)
          .addClass(this.myClass())
          .addClass(this.myClass('placeholder'))
          .tag(input)
          .on('paste', evt => {
            if ( ! evt.clipboardData.types.includes('text/plain') || ! evt.clipboardData.getData('text').trim() ) {
              evt.preventDefault();
              evt.stopPropagation();
            }
          })
          .on('keydown', evt => {
            if ( evt.keyCode == 8 || evt.keyCode == 46 ) this.setStateOnDelete(evt);
          });
    },

    function setStateOnDelete(evt) {
      this.isDelete = true;
      this.includeTrailingDelimiter = false;
      var start = evt.target.selectionStart;
      var end = evt.target.selectionEnd;
      // treat deleting single character as deleting a selectionrange of length 1
      if ( start == end ) start--; 

      // if start of selection is a delimiter, remove the entire delimiter
      if ( isNaN(this.formattedData[start]) ) {
        while ( start > 0 && isNaN(this.formattedData[start - 1]) ) start--;
        evt.target.setSelectionRange(start, end);
      } else {
        // if removing a digit from the end keep trailing delimiter
        if ( this.formattedData.substring(end).replace(/\D/g,'') == '' ) this.includeTrailingDelimiter = true;
      }
    },

    function resetState() {
      this.isDelete = false;
      this.includeTrailingDelimiter = true;
      this.formatted = false;
    }
  ],

  listeners: [
    {
      name: 'formatData',
      code: function () {
        this.data = this.formattedData.replace(/\D/g,'');
        if ( this.formatted || this.formattedData.trim() == '' ) {
          this.resetState();
          return;
        }
  
        var startingPos = this.el() ? this.el().children[0].selectionStart : this.formattedData.length;
        var endPos = this.el() ? this.el().children[0].selectionEnd : this.formattedData.length;
  
        // keep track of number of digits before selection start and use is as a initial value for final position of the cursor
        var digitsBeforeSelectionStart = pos = this.formattedData.substring(0, startingPos).replace(/\D/g, '').length;
        // if not typing from the end of the string, do not add trailing delimiters
        if ( endPos < this.formattedData.length ) this.includeTrailingDelimiter = false;
  
        var temp = '';
        var index = 0;
        for ( const format of this.formatter ) {
          if ( typeof format === 'number' || ! isNaN(format) ) {
            temp += this.data.substring(index, index += format);
            if ( index > this.data.length || ( index == this.data.length && ! this.includeTrailingDelimiter ) ) break;
          } else if ( typeof format === 'string' ) {
            temp += format;
            // if a delimiter has been inserted at an index before pos, increment pos
            if ( index <= digitsBeforeSelectionStart ) pos += format.length;
            // on delete, if index is 0, i.e., string begins with delimiter, increment startingPos
            if ( this.isDelete && startingPos == 0 && this.data.length > 0 ) startingPos += format.length;
          }
        }
        if ( temp != this.formattedData ) {
          // set this to true so that when formatData is invoked by the assignment below it will return instead
          this.formatted = true;
          pos = this.isDelete ? startingPos : pos; // final cursor position is fixed on delete
          this.formattedData = temp;
          
          this.el() && this.el().children[0].setSelectionRange(pos, pos);
        }
        this.resetState();
      }
    }
  ]
});
