/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.boot',
  name: 'DAONSpecMenu',
  extends: 'foam.nanos.menu.Menu',

  documentation: 'Psedo-menu to display all DAO NSpecs as sub-menus.',

  implements: [ 'foam.mlang.Expressions' ],

  requires: [
    'foam.comics.v2.DAOControllerConfig',
    'foam.dao.ArrayDAO',
    'foam.dao.PromisedDAO',
    'foam.nanos.controller.Memento',
    'foam.nanos.menu.LinkMenu',
    'foam.nanos.menu.Menu'
  ],

  imports: [ 'nSpecDAO' ],

  properties: [
    {
      name: 'children_',
      factory: function() {
        /* ignoreWarning */
        var aDAO = this.ArrayDAO.create();
        var pDAO = this.PromisedDAO.create();
        this.nSpecDAO.where(
          this.AND(
            this.ENDS_WITH(foam.nanos.boot.NSpec.ID, 'DAO'),
            this.EQ(foam.nanos.boot.NSpec.SERVE,     true)
          )).select((spec) => {
            var menu = this.Menu.create({
              id:      'admin.data' + this.Memento.SEPARATOR + spec.id,
              label:   foam.String.labelize(spec.name),
              parent:  this.id,
              handler: this.LinkMenu.create({link: '#admin.data' + this.Memento.SEPARATOR + spec.id})
            });
            aDAO.put(menu);
        }).then(() => pDAO.promise.resolve(aDAO));

        return pDAO;
      }
    },
    {
      name: 'children',
      // Use getter instead of factory to have higher precedence
      // than than 'children' factory from relationship
      getter: function() { return this.children_; }
    }
  ]
});
