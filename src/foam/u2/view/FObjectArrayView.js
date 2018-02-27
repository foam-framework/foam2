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

      var controllerMode = this.mode === foam.u2.DisplayMode.RW &&
          (this.data.visibility === foam.u2.Visibility.RW ||
           this.controllerMode === foam.u2.ControllerMode.CREATE) ?
          this.controllerMode : foam.u2.ControllerMode.VIEW;
      this.add(this.ADD_ITEM).add(this.slot(function(data) {
        return this.E().forEach(data, function(o, index) {
          var tag = this.tag({
            class: self.detailView,
            controllerMode: controllerMode,
          }, {data: o});
          if ( this.mode === foam.u2.DisplayMode.RW ) {
            tag.start().add('Remove').addClass('rmv-button')
                .on('click', function(){ self.removeIt(index) }).end();
          }
        });
      }));
    },

    function fromProperty(p) {
      this.SUPER(p);
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
      isAvailable: function(mode) {
        return mode === foam.u2.DisplayMode.RW;
      },
      code: function() {
        var data = foam.Array.clone(this.data);
        data.push(this.of.create(null, this));
        this.data = data;
      }
    }
  ]
});
