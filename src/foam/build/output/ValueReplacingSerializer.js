/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.build.output',
  name: 'ValueReplacingSerializer',
  extends: 'foam.build.output.ProxySerializer',
  exports: [
    'chain',
    'delegate as out',
  ],
  requires: [
    'foam.build.output.replacer.ArgumentClassStrip',
    'foam.build.output.replacer.EnumModelClassStrip',
    'foam.build.output.replacer.EnumValueAxiomReplacer',
    'foam.build.output.replacer.ExportsNameOnlyReplacer',
    'foam.build.output.replacer.ImplementsPathOnlyReplacer',
    'foam.build.output.replacer.ImportsPathOnlyReplacer',
    'foam.build.output.replacer.InterfaceMethodClassStrip',
    'foam.build.output.replacer.InterfaceModelClassStrip',
    'foam.build.output.replacer.MethodClassStrip',
    'foam.build.output.replacer.MethodJsCodeOnlyReplacer',
    'foam.build.output.replacer.ModelOrderer',
    'foam.build.output.replacer.PropertyOrderer',
    'foam.build.output.replacer.PropertyNameOnlyReplace',
    'foam.build.output.replacer.RelationshipClassStrip',
    'foam.build.output.replacer.RequiresPathOnlyReplacer',
  ],
  properties: [
    {
      class: 'Array',
      name: 'chain',
    },
    {
      class: 'FObjectArray',
      of: 'foam.build.output.Replacer',
      name: 'rules',
      factory: function() {
        return [
          this.ArgumentClassStrip.create(),
          this.EnumModelClassStrip.create(),
          this.EnumValueAxiomReplacer.create(),
          this.ExportsNameOnlyReplacer.create(),
          this.ImplementsPathOnlyReplacer.create(),
          this.ImportsPathOnlyReplacer.create(),
          this.InterfaceMethodClassStrip.create(),
          this.InterfaceModelClassStrip.create(),
          this.ModelOrderer.create(),
          this.RelationshipClassStrip.create(),
          this.RequiresPathOnlyReplacer.create(),

          this.MethodJsCodeOnlyReplacer.create(),
          this.MethodClassStrip.create(),

          this.PropertyNameOnlyReplace.create(),
          this.PropertyOrderer.create(),
        ];
      },
    },
  ],
  methods: [
    function output(x, v) {
      var self = this;
      self.chain.push(v)

      var r = self.rules.find(function(r) { return r.f(self.chain) })
      if ( r ) r.output(x, v);
      else this.delegate.output(x, v);

      self.chain.pop()
    },
  ],
});
