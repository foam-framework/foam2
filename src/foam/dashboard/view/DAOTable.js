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
    'foam.dashboard.view.DashboardCitationView'
  ],
  imports: [ 'data' ],

  properties: [
    {
      name: 'citationView',
      factory: function() {
        return this.DashboardCitationView;
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this
        .addClass(this.myClass())
        .add(this.slot(function(data$dao, data$limit) {
          return self.E()
            .addClass(this.myClass())
            .select(data$dao.limit(data$limit), function(obj) {
              return self.E()
                .start().addClass('table-row')
                .start({
                  class: self.citationView,
                  data: obj,
                  of: data$dao.of
                })
               .end();
           });
        }));
    }
  ],

  css: `
    ^ .table-row:hover {
      background: /*%GREY5%*/ #f5f7fa;
      cursor: pointer;
    }
    ^ .table-row {
      padding-left: 20px;
      padding-right: 20px;
    }
//    ^ .table-row:last-child > *{
//      border-bottom: none;
//    }
  `
});
