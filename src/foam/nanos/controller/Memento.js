/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.controller',
  name: 'Memento',

  constants: {
    SEPARATOR: ':'
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
    }
  ],
   
  methods: [
    function combine() {
      return this.tail ?
        this.head + this.SEPARATOR + this.tail.combine() :
        this.head ;
    },
    function parseValue() {
      //added as value's subscribers methods are executed earlier then post set
      if ( this.feedback_ ) return;
      this.feedback_ = true;
      var i = this.value.indexOf(this.SEPARATOR);
      if ( i == -1 ) {
        this.head = this.value;
        this.tail = null;
      } else {
        this.head = this.value.substring(0, i);
        this.tail = this.cls_.create({ value: this.value.substring(i+1), parent: this });
      }
      this.feedback_ = false;
    }
  ]
});
