/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.parse',
  name: 'InvalidPStream',
  properties: [
    {
      name: 'head',
      getter: function() { return undefined; },
      setter: function() {}
    },
    {
      name: 'tail',
      getter: function() { return this; },
      setter: function() {}
    },
    {
      name: 'value',
      setter: function(v) { this.instance_.value = v; },
      getter: function() { return this.instance_.value; }
    },
    {
      name: 'valid',
      getter: function() { return false; }
    }
  ],
  methods: [
    function initArgs() {},

    function setValue(value) {
      if ( value === undefined ) value = null;
      var ps = this.cls_.create();
      ps.value = value;
      return ps;
    },

    function substring(end) {
      return null;
    },

    function apply(p, obj) {
      return undefined;
    }
  ]
});
