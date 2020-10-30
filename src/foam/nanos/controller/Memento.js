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
    EQUILITY_SIGN: '='
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
    },
    {
      name: 'paramsArr',
      expression: function(params) {
        var dict = {};
        var i = 0;//a=q,q,q,b=sd,z=sdf
        while( i >= 0 ) {
          var beginWith = i;
          var equalitySumbolIndex = params.indexOf(this.EQUILITY_SIGN, i);
          var nextEqualitySumbolIndex = params.indexOf(this.EQUILITY_SIGN, equalitySumbolIndex + 1);
          var thisParameterValueToParse;
          if ( nextEqualitySumbolIndex == -1 ) {
            thisParameterValueToParse = params.substring(equalitySumbolIndex);
          } else {
            var beginWith1 = equalitySumbolIndex;
            while ( true ) {
              var indexOfComa = params.indexOf(',', beginWith1 + 1);
              if (indexOfComa > nextEqualitySumbolIndex ) {
                break;
              }
              beginWith1 = indexOfComa;
            }
            thisParameterValueToParse = params.substring(equalitySumbolIndex + 1, beginWith1);
            i = beginWith1;
          }
          dict[params.substring(beginWith, equalitySumbolIndex)] = params.substring(equalitySumbolIndex + 1, i > 0 ? i : params.length).split(',');
        }
        return dict;
      }
    }
  ],
   
  methods: [
    function combine() {
      return this.tail ?
        this.head + this.SEPARATOR 
        + this.PARAMS_BEGIN
        + this.params
        + this.PARAMS_END
        + this.tail.combine() :
        this.head ;
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
        var j = this.value.indexOf(this.SEPARATOR, i + 1);
        if ( tailStr.includes(this.PARAMS_BEGIN) && tailStr.includes(this.PARAMS_END) ) {
          this.params = this.value.substring(i+1, j > 0 ? j : this.value.length);
          if ( j == -1 ) {
            this.tail = null;
          } else {
            this.tail = this.cls_.create({ value: this.value.substring(j+1), parent: this });
          }
        } else {
          this.tail = this.cls_.create({ value: this.value.substring(i+1), parent: this });
        }
      }
      this.feedback_ = false;
    }
  ]
});
