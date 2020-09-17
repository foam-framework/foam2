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
          return foam.u2.ViewSpec.createView(this.rowView, { data: obj }, this, this.__subSubContext__)
            .on('click', function() {
              if ( !obj ) {
                dao.find(val[0]).then(function(v) {
                obj = v;
                self.dblclick && self.dblclick(obj);
                });
              } else
                self.dblclick && self.dblclick(obj);
            })
        });
    }
  ]
});
