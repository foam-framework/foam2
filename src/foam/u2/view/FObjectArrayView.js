/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'FObjectArrayView',
  extends: 'foam.u2.View',
  
  requires: [
    'foam.core.Property',
    'foam.u2.DetailPropertyView'
  ],

  documentation: 'View for editing FObjects.',

  axioms: [
    foam.u2.CSS.create({/*
      code: '^:read-only { border: none; background: rgba(0,0,0,0); }'
      .btn{
        background: lightpink;
      }
      */
    })
  ],

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      name: 'data'
    },
    {
      class: 'Int',
      name: 'arrayIndex'
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

      this.startContext({data: this})
      this.add(this.ADD_ITEM).add(this.slot(function(data) {
        return this.E().forEach(data, function(o, index) {
          this.tag({class: self.detailView}, {data: o})
          .start().add('Remove').addClass('btn').style({ 'background' : 'rgba(216, 30, 5, 0.3)' }).on('click', function(){ self.removeIt(index) }).end()
        })
      }))
      this.endContext();
      
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