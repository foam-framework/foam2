/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ReadReferenceView',
  extends: 'foam.u2.View',

  documentation: 'A read-only view for a Reference Property.',

  requires: [
    'foam.comics.v2.DAOControllerConfig',
    'foam.u2.detail.SectionedDetailView',
    'foam.u2.view.ReferenceCitationView'
  ],

  properties: [
    'obj',
    'prop',
    {
      documentation: `Create the reference view as an anchor link to the reference's  DetailView.`,
      name: 'enableLink',
      class: 'Boolean',
      value: true
    }
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
          .add(this.obj$.map(obj => {
            if ( ! obj ) return '';
            if ( this.enableLink ) {
              return this.E().start('a')
                .attrs({ href: '#'})
                .on('click', function(evt) {
                  evt.preventDefault();
                  self.stack.push({
                    class: 'foam.comics.v2.DAOSummaryView',
                    data: self.obj,
                    of: self.obj.cls_,
                    config: self.DAOControllerConfig.create({
                      daoKey: self.prop.targetDAOKey
                    }),
                    backLabel: 'Back'
                  }, self);
                })
                .tag(self.ReferenceCitationView, {data: obj})
              .end();
            } else {
              return this.E().start()
              .tag(self.ReferenceCitationView, {data: obj})
              .end();
            }
          }));
      }
    },

    function fromProperty(prop) {
      this.SUPER(prop);
      this.prop = prop;
      var dao = this.ctrl.__subContext__[prop.targetDAOKey];
      if ( dao )
        dao.find(this.data).then((o) => this.obj = o);
    }
  ]
});
