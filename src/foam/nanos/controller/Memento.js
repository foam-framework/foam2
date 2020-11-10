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
      // value: '',
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
        // if ( this.tail )
        //   this.tail.parent = this;

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
      name: 'parent',
      postSet: function() {
        console.log('parent change');
        // console.log('not equal: ' + this.parent.tail == this);
      }
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
      postSet: function() {
        if ( this.feedback_ ) {
          return;
        }
        this.feedback_ = true;
        var dict = {};
        if ( this.params ) {
          this.params = decodeURI(this.params);
          dict = JSON.parse(this.params);
        }
        this.paramsDict = dict;
        this.feedback_ = false;
      },
      value: ''
    },
    {
      name: 'paramsDict',
      postSet: function() {
        if ( this.feedback_ ) {
          return;
        }
        this.feedback_ = true;
        if ( this.params ) {
          this.params = JSON.stringify(this.paramsDict);
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
      //added as value's subscribers methods are executed earlier then post set
      if ( this.feedback_ ) return;
      this.feedback_ = true;
      var i = this.value.indexOf(this.SEPARATOR);
      if ( i === -1 ) {
        this.head = this.value;
        this.tail = null;
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
          }
        } else {
          this.tail = this.cls_.create({ value: tailStr, parent: this });
        }
      }
      this.feedback_ = false;
    }
  ]
});
