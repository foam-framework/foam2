/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'DAOTable',
  extends: 'foam.u2.Element',
  requires: [
    'foam.u2.view.TableView',
  ],
  imports: [ 'data' ],
  css: `
^ {
  overflow: auto;
}

^ table {
 width: 100%;
}
  `,
  methods: [
    function initE() {
      this.
        addClass(this.myClass()).
        add(this.slot(function(data$dao, data$limit, data$columns) {
          var view = this.TableView.create({
            data: data$dao.limit(data$limit),
          });

          if ( data$columns && data$columns.length )
            view.columns = data$columns;

          return view;
        }));
    }
  ]
});
