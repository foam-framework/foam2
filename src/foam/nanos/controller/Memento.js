/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.controller',
  name: 'Memento',

  constants: {
    SEPARATOR: ':',
    PARAMS_BEGIN: '{',
    PARAMS_END: '}'
  },

  properties: [
    {
      class: 'Boolean',
      name: 'feedback_',
      documentation: 'Internal flag to prevent feedback loops'
    },
    {
      name: 'value',
      value: '',
      postSet: function(o, n) {
        this.parseValue();
      }
    },
    {
      name: 'head',
      value: '',
      postSet: function(o, n) {
        if ( this.feedback_ ) return;
        this.feedback_ = true;
        this.value = this.combine();
        this.feedback_ = false;
      }
    },
    {
      name: 'tail',
      postSet: function(o, n) {

        if ( this.feedback_ ) {
          return;
        }
        this.feedback_ = true;
        this.changeIndicator = ! this.changeIndicator;
        this.value = this.combine();
        this.feedback_ = false;
      },
      value: null
    },
    {
      name: 'parent'
    },
    {
      name: 'changeIndicator',
      postSet: function() {
        if ( this.parent ) {
          this.parent.feedback_ = true;
          this.parent.changeIndicator = ! this.parent.changeIndicator;
          this.parent.feedback_ = false;
        }
      }
    },
    {
      name: 'params',
      documentation: 'This property used to store parameters to configure a view. For example, for a table view such parameters could be search value or filter values.',
      postSet: function() {
        if ( this.feedback_ ) {
          return;
        }
        this.feedback_ = true;
        var obj = {};
        if ( this.params ) {
          this.params = decodeURI(this.params);
          obj = JSON.parse(this.params);
        }
        this.paramsObj = obj;
        this.feedback_ = false;
      },
      value: ''
    },
    {
      name: 'paramsObj',
      postSet: function() {
        if ( this.feedback_ ) {
          return;
        }
        this.feedback_ = true;
        if ( Object.keys(this.paramsObj).length !== 0 ) {
          this.params = JSON.stringify(this.paramsObj);
        } else {
          this.params = '';
        }
        this.changeIndicator = ! this.changeIndicator;
        this.value = this.combine();
        this.feedback_ = false;
      },
      factory: function() {
        return {};
      }
    }
  ],
   
  methods: [
    function combine() {
      var params =  this.params ?  this.SEPARATOR + this.params : '';
      var tail = this.tail ? this.SEPARATOR + this.tail.combine() : '';
      return this.head
        + params
        + tail;
    },
    function parseValue() {
      if ( this.feedback_ ) return;
      this.feedback_ = true;
      var i = this.value.indexOf(this.SEPARATOR);
      if ( i === -1 ) {
        this.head = this.value;
        this.tail = null;
        this.feedback_ = false;
        this.params = '';
        this.feedback_ = true;
      } else {
        this.head = this.value.substring(0, i);
        var tailStr = this.value.substring(i+1);
        var tailIndex = this.value.indexOf(this.SEPARATOR, i+1); 
        if ( tailStr.includes(this.PARAMS_BEGIN) && tailStr.includes(this.PARAMS_END) && ( tailIndex === -1 || this.value.indexOf(this.PARAMS_BEGIN, i+1) < tailIndex ) ) {
          if ( this.value.indexOf(this.PARAMS_BEGIN) === i + 1 ) {
            this.feedback_ = false;
            var paramEndIndex = tailStr.indexOf(this.PARAMS_END + this.SEPARATOR);
            paramEndIndex = paramEndIndex == -1 ? tailStr.length : paramEndIndex + 1;
            this.params = tailStr.substring(tailStr.indexOf(this.PARAMS_BEGIN), paramEndIndex);
            this.feedback_ = true;
            if ( paramEndIndex !== -1 && paramEndIndex !== tailStr.length ) {
              this.tail = this.cls_.create({ value: tailStr.substring(paramEndIndex + 1), parent: this });
            }
          } else {
            this.tail = this.cls_.create({ value: tailStr, parent: this });
            this.params = '';
          }
        } else {
          this.tail = this.cls_.create({ value: tailStr, parent: this });
          this.params = '';
        }
      }
      this.feedback_ = false;
    }
  ]
});
