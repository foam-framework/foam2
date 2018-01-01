/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'FObjectArrayView',
  extends: 'foam.u2.View',

  documentation: 'View for editing FObjects inside of FObjectArrays.',

  requires: [
    'foam.core.Property',
    'foam.u2.DetailPropertyView'
  ],

  exports: [ 'as data' ],

  css: `
    .rmv-button{
      background: rgba(216, 30, 5, 0.3);
      width: 125px;
      text-align: center;
      color: indianred;
      padding: 10px;
      font-size: 12px;
      border-radius: 3px;
    }
  `,

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      name: 'data'
    },
    'choices',
    {
      name: 'detailView',
      value: 'foam.u2.DetailView'
    }
  ],

  methods: [
    function initE() {
      var self = this;

      this.add(this.ADD_ITEM).add(this.slot(function(data) {
        return this.E().forEach(data, function(o, index) {
          this.tag({class: self.detailView}, {data: o})
          .start().add('Remove').addClass('rmv-button').on('click', function(){ self.removeIt(index) }).end()
        })
      }));
    },

    function fromProperty(p) {
      console.assert(p.of, 'Property "of" required for FObjectArrayView.');
      this.of = p.of;
    }
  ],

  listeners: [
    function removeIt(index){
      var data = foam.Array.clone(this.data);
      data.pop(index);
      this.data = data;
    }
  ],

  actions: [
    {
      name: 'addItem',
      code: function() {
        var data = foam.Array.clone(this.data);
        data.push(this.of.create(null, this));
        this.data = data;
      }
    }
  ]
});
