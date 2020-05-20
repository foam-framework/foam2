/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'GroupingDAOList',
  extends: 'foam.u2.Element',

  implements: [ 'foam.mlang.Expressions' ],

  documentation: 'A DAOList which groups citation views by the supplied groupExpr',

  topics: [ 'rowClick' ],

  exports: [
    'selection',
    'hoverSelection',
    'data as dao'
  ],

  imports: [
    'editRecord?',
    'selection? as importSelection'
  ],

  css: `
    ^group-title {
      // TODO
    }
  `,

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'rowView'
    },
    {
      name: 'groupExpr',
      documentation: 'An expression which returns the group title. Can be a Property.'
    },
    {
      name: 'order',
      documentation: 'Optional order used to sort citations within a group'
    },
    'selection',
    'hoverSelection'
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass());

      this.update();
      this.data$proxy.on.sub(this.update)
    }
  ],

  listeners: [
    {
      name: 'update',
      isMerged: true,
      mergeDelay: 100,
      code: function() {
        var curGroup;
        var dao = this.order ? this.data.orderBy(this.order) : this.data;

        this.removeAllChildren();

        dao.select(obj => {
          var group = this.groupExpr.f(obj);
          if ( group !== curGroup ) {
            this.start().
              addClass(this.myClass('group-title')).
              add(group)
            .end();
          }
          curGroup = group;

          this.add(foam.u2.ViewSpec.createView(
            this.rowView,
            { data: obj },
            this,
            this.__subSubContext__));
        });
      }
    }
  ]
});
