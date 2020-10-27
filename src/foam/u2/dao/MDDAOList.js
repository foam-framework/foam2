/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.dao',
  name: 'MDDAOList',
  extends: 'foam.u2.Element',

  topics: [ 'rowClick' ],

  exports: [
    'data as dao'
  ],

  imports: [
    'dblclick'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'rowView'
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.
        addClass(this.myClass()).
        select(this.data$proxy, function(obj) {
          var rowView = foam.u2.ViewSpec.createView(this.rowView, { data: obj }, this, this.__subSubContext__);
          return self.E().start().addClass('md-row')
            .add(rowView)
            .on('click', function() {
              if ( ! obj ) {
                dao.find(val[0]).then(function(v) {
                obj = v;
                self.dblclick && self.dblclick(obj);
                });
              } else
                self.dblclick && self.dblclick(obj);
            })
            .end();
        });
    }
  ],

  css: `
  ^ {
    height: 100%;
    overflow: scroll;
    overflow-x: hidden;
  }
  ^ .md-row {
    display: flex;
    color: /*%GREY1%*/ #5e6061;
    height: 150px;
    padding: 3rem;
    font-size: 2.5rem;
    font-weight: 300;
    border-bottom: 1px solid /*%GREY3%*/;
  }

  `
});
