/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.controller',
  name: 'Memento',

  constants: [
    { name: 'SEPARATOR',    value: '::'},
    { name: 'PARAMS_BEGIN', value: '{'},
    { name: 'PARAMS_END',   value: '}'},

    {
      name: 'OUTPUTTER',
      factory: function() { return foam.json.Outputter.create({
        strict: false,
        pretty: false
      });}
    }
  ],

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
        //to update parent on value change but not on value set first time 
        this.parseValue();
      }
    },
    {
      name: 'head',
      value: '',
      postSet: function(o, n) {
        if ( this.feedback_ ) return;
        this.feedback_ = true;
        this.changeIndicator = ! this.changeIndicator;
        this.feedback_ = false;
      }
    },
    {
      name: 'tail',
      postSet: function(o, n) {
        if ( n && ! n.parent )
          n.parent = this;
        //clean up
        if ( o )
          o.parent = null;

        if ( this.feedback_ ) return;
        this.feedback_       = true;
        this.changeIndicator = ! this.changeIndicator;
        this.feedback_       = false;
      },
      value: null
    },
    {
      name: 'parent'
    },
    {
      name: 'changeIndicator',
      postSet: function() {
        this.value                    = this.combine();
        if ( this.parent ) {
          this.parent.feedback_       = true;
          this.parent.changeIndicator = ! this.parent.changeIndicator;
          this.parent.feedback_       = false;
        }
      }
    }
  ],

  methods: [
    function combine() {
      var params =  this.params ?  this.SEPARATOR + this.params : '';
      var tail = this.tail ? this.SEPARATOR + this.tail.combine() : '';
      return this.head + params + tail;
    },
    function parseValue() {
      if ( this.feedback_ ) return;
      this.feedback_ = true;

      this.value = decodeURI(this.value);
      
      var i = this.value.indexOf(this.SEPARATOR);

      var params = '';
      if ( i === -1 ) {
        this.head = this.value;
        this.tail = null;
      } else {
        this.head     = this.value.substring(0, i);
        var tailStr   = this.value.substring(i + 2);
        this.tail$.set(this.cls_.create({ value: tailStr, parent: this }));
      }
      this.feedback_ = false;
      this.params    = params;
    },
    function returnTail() {
      var tail = this;
      while ( tail.tail != null ) {
        tail = tail.tail;
      }
      return tail;
    },
    function findMementoTail(mementoHead) {
      var tail = this;
      while ( tail != null ) {
        if ( tail.head === mementoHead )
          return tail;
        tail = tail.tail;
      }
      return tail;
    }
  ]
});
