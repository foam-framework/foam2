/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.flow.widgets',
  name: 'ModelSummary',
  extends: 'foam.u2.Element',
  documentation: `
    Brief summary of a model for overview documentation.
  `,

  imports: [
    'capabilityDAO?'
  ],

  requires: [
    'foam.core.PromiseSlot',
    'foam.u2.Element'
  ],

  properties: [
    {
      name: 'of',
      class: 'Class'
    },
    {
      name: 'showProperties',
      class: 'Boolean'
    },
    {
      name: 'visibleModelProps',
      class: 'StringArray',
      factory: () => ['package','name','extends','implements'],
      adapt: function (_, v) {
        if ( typeof v === 'string' ) {
          return v.split(',');
        }
        return v;
      }
    },
    {
      // TODO: use this property for a "show more" option
      name: 'moreModelProps',
      class: 'StringArray',
      factory: () => ['imports','exports','requires']
    },
    {
      name: 'adapters',
      factory: () => ({
        implements: arry => arry.map(impl => impl.path).join(', ')
      })
    },
    {
      name: 'tables',
      factory: () => ({
        'foam.core.Constant': {
          headings: ['Name', 'Documentation', 'Value'],
          adapt: cons => [cons.name, cons.documentation, cons.value]
        }
      })
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this
        .start('table')
          .start('tr')
            .start('th').add('Property').end()
            .start('th').add('Value').end()
          .end()
          .forEach(this.visibleModelProps, function (p) {
            var value = self.of.model_[p];
            if ( self.adapters[p] ) value = self.adapters[p](value);
            var subTable = value && Array.isArray(value) &&
              value.length > 0 && self.tables[value[0].cls_.id];
            this
              .start('tr')
                .start('td').add(p).end()
                .start('td')
                  .callIfElse(subTable, function () {
                    this
                      .start('table')
                        .start('tr')
                          .forEach(subTable.headings, function (h) {
                            this.start('th').add(h).end();
                          })
                        .end()
                        .forEach(value, function (vRow) {
                          this
                            .start('tr')
                            .forEach(subTable.adapt(vRow), function (vCell) {
                              this.start('td').add(self.matchRef(vCell)).end();
                            })
                            .end()
                        })
                      .end()
                      ;
                  }, function () {
                    this.add(value);
                  })
                .end()
              .end()
          })
        .end()
        ;
    },
    function matchRef(id) {
      if ( typeof id !== 'string' ) return id;
      if ( this.capabilityDAO ) {
        return this.PromiseSlot.create({
          promise: this.capabilityDAO.find(id)
        }).map(found => found
          ? this.Element.create({ nodeName: 'a' })
            .attrs({
              href: '#admin.crunchlab:'+id,
              target: '_blank'
            })
            .add(id)
          : id
        );
      }
    }
  ]
});
