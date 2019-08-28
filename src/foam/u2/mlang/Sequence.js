/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.mlang',
  name: 'Sequence',
  extends: 'foam.dao.AbstractSink',
  properties: [
    {
      name: 'data',
    },
  ],
  methods: [
    function put(o, s) {
      this.data.forEach(function(d) {
        d.put(o, s);
      });
    },
    function remove(o, s) {
      this.data.forEach(function(d) {
        d.remove(o, s);
      });
    },
    function reset(s) {
      this.data.forEach(function(d) {
        d.reset(s);
      });
    },
    function eof() {
      this.data.forEach(function(d) {
        d.eof();
      });
    },
    function toE(_, x) {
      return x.E().add(this.slot(function(data) {
        return x.E().forEach(data, function(d) {
          this.add(d)
        })
      }));
    }
  ]
});
