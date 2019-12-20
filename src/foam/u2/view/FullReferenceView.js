/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'FullReferenceView',
  extends: 'foam.u2.view.ReferenceView',
  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'detailView',
      value: {
        class: 'foam.u2.DetailView'
      }
    },
  ],
  methods: [
    function initE() {
      var self = this;
      this.SUPER();
      this.add(this.slot(function(dao, data, detailView) {
        return dao.find(data).then(d => {
          if ( ! d ) return null; // NOTE: We have to return null here instead of undefined, otherwise we end up with an infinite loop.
          return self.E()
            .startContext({ controllerMode: foam.u2.ControllerMode.VIEW })
              .tag(detailView, { data: d })
            .endContext();
        })
      }));
    }
  ]
});