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
    PARAMS_END: '}',
    PARAMS_SEPARATOR: ',',
    EQUILITY_SIGN: '=',
    NEXT_INDEX: 1
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
          var params = decodeURI(this.params);
          var i = 1;//a=q,q,q,b=sd,z=sdf
          while( i >= 0 && i < params.length - 1 ) {
            var beginWith = i;
            var equalitySumbolIndex = params.indexOf(this.EQUILITY_SIGN, i);
            var nextEqualitySumbolIndex = params.indexOf(this.EQUILITY_SIGN, equalitySumbolIndex + this.NEXT_INDEX);
            nextEqualitySumbolIndex = nextEqualitySumbolIndex > -1 ? nextEqualitySumbolIndex : params.length - 1;
            var thisParameterValueToParse;
            var beginWith1 = equalitySumbolIndex;
            while (  indexOfComa !== -1  ) {
              var indexOfComa = params.indexOf(this.PARAMS_SEPARATOR, beginWith1 + this.NEXT_INDEX);
              if ( indexOfComa > nextEqualitySumbolIndex ) {
                break;
              }
              beginWith1 = indexOfComa;
            }
            thisParameterValueToParse = params.substring(equalitySumbolIndex + 1, nextEqualitySumbolIndex);
            i = beginWith1 + this.NEXT_INDEX;
  
            dict[params.substring(beginWith, equalitySumbolIndex)] = params.substring(equalitySumbolIndex + this.NEXT_INDEX, i > 0 ? i - 1 : params.length - 1).split(this.PARAMS_SEPARATOR);
            if ( beginWith1 == -1 )
              break; 
          }
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
        var params = this.PARAMS_BEGIN;
        for ( var key in this.paramsDict ) {
          params += encodeURI(key);
          params += this.EQUILITY_SIGN;
          params += this.paramsDict[key].join(',');
        }
        params += this.PARAMS_END;
        params = encodeURI(params);
        this.params = params;
        this.feedback_ = false;
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
        if ( tailStr.includes(this.PARAMS_BEGIN) && tailStr.includes(this.PARAMS_END) ) {
          if ( this.value.indexOf(this.PARAMS_BEGIN) === i + 1 ) {
            this.feedback_ = false;
            this.params = this.value.substring(i+1, this.value.indexOf(this.PARAMS_END) + 1);
            this.feedback_ = true;
            if ( this.value.indexOf(this.PARAMS_END) != this.value.length - 1 ) {
              this.tail = this.value.substring(this.value.indexOf(this.PARAMS_END) + 2);//2 is for excluding } and : 
            }
          } else {
            this.tail = this.cls_.create({ value: this.value.substring(i+1), parent: this });
          }
          
        } else {
          this.tail = this.cls_.create({ value: this.value.substring(i+1), parent: this });
        }
      }
      this.feedback_ = false;
    }
  ]
});
