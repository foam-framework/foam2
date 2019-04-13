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
    'foam.u2.view.TableView',
  ],
  imports: [
    'data',
  ],
  properties: [
    {
      name: 'tableCls',
      expression: function(data$data$arg1, data$data$arg2) {
        var model = this.Model.create({
          name: 'TableModel',
          properties: [
            {
              name: 'id',
              label: data$data$arg1.label || data$data$arg1.cls_.name,
            },
            {
              name: 'value',
              label: data$data$arg2.label || data$data$arg2.cls_.name,
            },
          ]
        });
        return model.buildClass();
      },
    },
  ],
  css: `
    ^ table {
      width: 100%;
    }
  `,
  methods: [
    function initE() {
      this.
        addClass(this.myClass()).
        add(this.slot(function(tableCls, data$data$groups, data$data) {
          var dao = this.ArrayDAO.create({ of: tableCls });
          data$data.sortedKeys().forEach(function(k) {
            dao.put(tableCls.create({
              id: '' + k,
              value: data$data$groups[k].value,
            }));
          })
          return this.TableView.create({ data: dao });
        }))
    }
  ]
});
