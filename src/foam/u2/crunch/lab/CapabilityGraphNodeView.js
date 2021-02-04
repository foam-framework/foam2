/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.lab',
  name: 'CapabilityGraphNodeView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.crunch.CapabilityFeatureView'
  ],

  imports: [
    'memento'
  ],

  css: `
    ^div {
      position: relative;
      top: 15px;
      left: 15px;

      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;

      border-radius: 10px;
      box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2);
      border: solid 1px #e7eaec;
      background-color: #ffffff;

      overflow: hidden;
    }

    ^segment {
      border-bottom: 1px solid rgba(0,0,0,0.4);
      background-color: rgba(255,255,255,0.7);
      padding: 8px 0;
      text-align: center;
      margin-bottom: 8px;
      box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2);
    }
    ^segment.title {
      font-size: 20px;
    }
    ^segment.tiny {
      font-size: 9px;
      width: inherit;
    }
  `,

  properties: [
    {
      name: 'nodeName',
      value: 'foreignObject'
    },
    {
      name: 'size',
      class: 'Array',
      factory: () => [100, 100]
    },
    {
      name: 'position',
      class: 'Array',
      factory: () => [0, 0]
    }
  ],

  methods: [
    function initE() {
      var self = this;
      var dims = {
        x: '' + (this.position[0] - 15),
        y: '' + (this.position[1] - 15),
        width:  '' + (this.size[0] + 30),
        height: '' + (this.size[1] + 30),
      };
      var capability = this.data;
      var ucj = null;
      if ( Array.isArray(this.data) ) {
        console.log('YES, ARRY', this.data);
        capability = this.data[0];
        ucj = this.data[1];
      }
      this
        .attrs({
          ...dims,
        })
        .start('div')
          .attrs({
            xmlns: 'http://www.w3.org/1999/xhtml',
          })
          .addClass(this.myClass('div'))
          .style({
            width: this.size[0],
            height: this.size[1],
          })
          .callIf(capability.icon, function () {
            this.style({
              'background-image': `url('${capability.icon}')`
            });
          })
          .start()
            .addClass(this.myClass('segment')).addClass('title')
            .add(foam.String.labelize(capability.name))
          .end()
          .start('button')
            .addClass(this.myClass('segment')).addClass('tiny')
            .add(capability.id)
            .on('click', function() {
              var menu = 'admin.data';
              var dao = 'capabilityDAO';
              self.memento.value = [menu, dao, capability.id].join(foam.nanos.controller.Memento.SEPARATOR);
            })
          .end()
          .callIf(ucj !== null, function () {
            this
              .start('button')
                .addClass(self.myClass('segment'))
                .callIf(ucj.status.background, function () {
                  this.style({
                    'background-color': ucj.status.background,
                    'width': 'inherit'
                  })
                })
                .callIf(ucj.status.color, function () {
                  this.style({
                    'color': ucj.status.color,
                  })
                })
                .add(ucj.status.label)
                .on('click', function() {
                  var menu = 'admin.data';
                  var dao = 'userCapabilityJunctionDAO';
                  self.memento.value = [menu, dao, ucj.id].join(foam.nanos.controller.Memento.SEPARATOR);
                })
              .end()
              ;
          })
        .end()
        ;
    }
  ]
});
