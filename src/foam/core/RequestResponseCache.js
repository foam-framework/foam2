/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core',
  name: 'RequestResponseCache',
  extends: 'foam.core.Map',
  documentation: `
    An axiom that, when installed, caches calls to the delegate based on the
    args that were passed in and stores them for the duration of the TTL.
  `,
  imports: [
    'setTimeout'
  ],
  requires: [
    'foam.core.Method',
  ],
  properties: [
    {
      class: 'Class',
      name: 'of',
      required: true
    },
    {
      class: 'String',
      name: 'ttlProp',
      value: 'ttl'
    },
    {
      class: 'String',
      name: 'delegateProp',
      value: 'delegate'
    },
    {
      class: 'StringArray',
      name: 'methods',
      factory: null,
      expression: function(of) {
        return of.getAxiomsByClass(this.Method).map(m => m.name);
      }
    }
  ],
  methods: [
    function installInClass(cls) {
      this.SUPER(cls);

      var prop = this;

      var axioms = this.methods
        .map(m => this.of.getAxiomByName(m))
        .map(m => this.Method.create(m))
        .map(m => m.copyFrom({
          code: function() {
            var key = foam.json.stringify({
              method: m.name,
              args: m.args.reduce((array, value, index) => {
                if ( value.type != 'Context' ) {
                  array.push(arguments[index])
                }
                return array;
              }, [])
            });
            var cache = this[prop.name];
            var delegate = this[prop.delegateProp];
            if ( ! cache[key] ) {
              cache[key] = delegate[m.name].apply(delegate, arguments);
              prop.setTimeout(() => delete cache[key], this[prop.ttlProp]);
            }
            return cache[key];
          }
        }));

      cls.installAxioms(axioms);
    }
  ]
});