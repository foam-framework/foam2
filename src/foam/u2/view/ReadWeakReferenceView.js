/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// TODO: almost a direct copy of ReadReferenceView - need to DRY it
foam.CLASS({
  package: 'foam.u2.view',
  name: 'ReadWeakReferenceView',
  extends: 'foam.u2.View',

  documentation: 'A read-only view for a Reference Property.',

  requires: [
    'foam.comics.v2.DAOControllerConfig',
    'foam.u2.detail.SectionedDetailView',
    'foam.u2.CitationView'
  ],

  properties: [
    'obj',
    'propValue'
  ],

  imports: [
    'ctrl',
    'stack'
  ],

  methods: [
    {
      name: 'initE',
      code: function() {
        var self = this;
        this.SUPER();
        this
          .start('a')
            .attrs({ href: '#' })
            .on('click', function(evt) {
              evt.preventDefault();
              self.stack.push({
                class: 'foam.comics.v2.DAOSummaryView',
                data: self.obj,
                of: self.obj.cls_,
                config: self.DAOControllerConfig.create({
                  daoKey$: self.data$.dot('targetDAOKey')
                })
              }, self);
            })
            .tag(this.CitationView, { data$: this.obj$ })
          .end();
      }
    },

    function fromProperty(prop) {
      this.SUPER(prop);

      var propValue = this.data;

      propValue.target = "Transaction Create on Scheduled Invoices"
      prop.targetDAOKey = "cronDAO";
      window.propValue = propValue;

      var ableToSetDAO =
        typeof propValue === 'object' &&
        foam.core.FObject.isInstance(propValue) &&
        propValue.targetDAOKey$ !== undefined
        ;
      var self = this;
      console.log(propValue.targetDAOKey);
      var dao = self.__context__[propValue.targetDAOKey];
      dao.find(propValue.target).then((o) => this.obj = o);
    }
  ]
});
