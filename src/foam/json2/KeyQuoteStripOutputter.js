/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.json2',
  name: 'KeyQuoteStripOutputter',
  extends: 'foam.json2.ProxyOutputterOutput',
  properties: [
    {
      name: 'stack',
      factory: function() { return []; },
    },
  ],
  enums: [
    {
      name: 'State',
      values: [
        'OBJECT',
        'ARRAY',
        'KEY',
      ],
    },
  ],
  methods: [
    {
      name: 'startObj',
      code: function() {
        if ( this.stack[this.stack.length - 1] == this.State.KEY ) {
          this.stack.pop();
        }
        this.stack.push(this.State.OBJECT);
        this.delegate.startObj();
      },
    },
    {
      name: 'endObj',
      code: function() {
        this.stack.pop();
        this.delegate.endObj();
      },
    },
    {
      name: 'startArray',
      code: function() {
        if ( this.stack[this.stack.length - 1] == this.State.KEY ) {
          this.stack.pop();
        }
        this.stack.push(this.State.ARRAY);
        this.delegate.startArray();
      },
    },
    {
      name: 'endArray',
      code: function() {
        this.stack.pop();
        this.delegate.endArray();
      },
    },
    {
      name: 'out',
      code: function(s) {
        var t = this.stack[this.stack.length - 1];
        if ( t == this.State.OBJECT ) {
          var match = s.match(/^"([a-z0-9]*)"$/i);
          if ( match ) s = match[1]
          this.stack.push(this.State.KEY);
        } else if ( t == this.State.KEY ) {
          this.stack.pop();
        }
        this.delegate.out(s);
      },
    },
  ],
})
