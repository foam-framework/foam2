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
    'data as dao',
    'as summaryView'
  ],

  imports: [
    'editRecord?',
    'selection? as importSelection'
  ],

  css: `
    ^group-title {
      font-family: /*%FONT1%*/;
      font-size: 35px;
      font-weight: 600;
      color: #1e1f21;
      margin: 40px 0px;
    }
    ^ .foam-nanos-notification-NotificationRowView {
      margin: 16px 0px;
      background: white;
      min-height: 50px;
      border-radius: 3px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
      border: solid 1px #e7eaec;
      background-color: #ffffff;
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
      class: 'FObjectProperty',
      name: 'groupExpr',
      documentation: 'An expression which returns the group title. Can be a Property.'
    },
    {
      class: 'FObjectProperty',
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
