/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.doc',
  name: 'MethodAxiom',
  extends: 'foam.doc.Axiom',
  requires: [
    'foam.doc.AxiomLink',
  ],
  tableColumns: ['type', 'name'],
  properties: [
    {
      name: 'name',
      label: 'Method and Description',
      tableCellFormatter: function(_, o) {
        this.
          start('code').
            start(o.AxiomLink, { cls: o.parentId, axiomName: o.axiom.name }).
            end().
            add('( ').
            forEach(o.axiom.args, function(arg, i) {
              this.
                callIf(i > 0, function() { this.add(',') }).
                add(' ').
                add(arg.of || 'Object'). // TODO which value should be used?
                add(' ').
                add(arg.name)
            }).
            add(' )').
          end().
          start('div').
            addClass('foam-doc-AxiomTableView-documentation').
            add(o.axiom.documentation).
          end()
      },
    },
    {
      class: 'String',
      name: 'type',
      expression: function(axiom$type) {
        return axiom$type || 'Void';
      },
      tableCellFormatter: function(v) {
        this.start('code').add(v).end();
      },
    },
  ],
})
