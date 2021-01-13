/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'Table',
  extends: 'foam.u2.Element',

  requires: [
    'foam.core.Model',
    'foam.dao.ArrayDAO',
    'foam.dashboard.view.DashboardCitationView'
  ],

  imports: [
    'data'
  ],

  properties: [
    {
      name: 'citationView',
      factory: function() {
        return this.DashboardCitationView;
      }
    },
    {
      name: 'listDAOName'
    },
    {
      name: 'searchKey'
    },
    {
      name: 'dao'
    },
    {
      name: 'tableCls',
      expression: function(data$data$arg1, data$data$arg2) {
        var model = this.Model.create({
          name: 'TableModel',
          tableColumns: [ 'id', 'value' ],
          properties: [
            {
              name: 'id',
              label: data$data$arg1.label || data$data$arg1.cls_.name
            },
            {
              name: 'value',
              label: data$data$arg2.label || data$data$arg2.cls_.name,
            },
            {
              name: 'listDAOName'
            },
            {
              name: 'searchKey'
            }
          ]
        });
        return model.buildClass();
      }
    }
  ],

  methods: [
    function initE() {
    var self = this;
      this.
        addClass(this.myClass()).
        add(this.slot(function(data$data$groups, data$data) {
          var dao = this.ArrayDAO.create({ of: self.tableCls });
          data$data.sortedKeys().forEach(function(k) {
            dao.put(self.tableCls.create({
              id: '' + k,
              value: data$data$groups[k].value,
              searchKey: self.searchKey,
              listDAOName: self.listDAOName
            }));
          })
          return self.E()
            .addClass(this.myClass())
            .select(dao, function(obj) {
              return self.E()
                .start().addClass('table-row')
                  .start({
                    class: self.citationView,
                    data: obj,
                    of: dao.of
                  })
                  .end()
                .end();
           });
       }))
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
    ^ div div:last-child div.table-row div {
      border-bottom: none;
    }
  `
});
