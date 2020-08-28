/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util.async',
  name: 'Sequence',

  implements: [
    'foam.core.ContextAgent'
  ],

  exports: [
    'endSequence'
  ],

  properties: [
    {
      name: 'contextAgentSpecs',
      class: 'FObjectArray',
      of: 'Object'
    },
    {
      name: 'halted_',
      class: 'Boolean'
    }
  ],

  methods: [
    function add(spec, args) {
      this.contextAgentSpecs.push({
        spec: spec,
        args: args
      });
      return this;
    },
    function execute() {
      // Call ContextAgents sequentially while reducing to a Promise
      var p = Promise.resolve(this.__subContext__);
      return this.contextAgentSpecs.reduce((p, seqspec) => {
        var contextAgent = null;
        return p.then(x => {
          if ( this.halted_ ) return Promise.resolve(x);

          var spec = seqspec.spec;
          var args = seqspec.args;

          // Note: logic copied from ViewSpec; maybe this should be in stdlib
          if ( spec.create ) {
            contextAgent = spec.create(args, x);
          } else {
            var cls = foam.core.FObject.isSubClass(spec.class)
              ? spec.class : ctx.lookup(spec.class);
            if ( ! cls ) foam.assert(false,
              'Argument to Sequence.add specifies unknown class: ', spec.class);
            contextAgent = cls.create(spec, x).copyFrom(args || {});
          }

          // Call the context agent and pass its exports to the next one
          return contextAgent.execute().then(() => contextAgent.__subContext__);
        })
      }, p);
    },
    function endSequence() {
      this.halted_ = true;
    }
  ],
});