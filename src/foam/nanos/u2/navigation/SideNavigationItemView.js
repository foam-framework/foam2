/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'SideNavigationItemView',
  extends: 'foam.u2.View',

  imports: [
    'currentMenu'
  ],

  requires: [
    'foam.nanos.menu.Menu',
  ],

  css:`
    ^selected {
      opacity:1 !important;
      text-shadow: 0 0 0px white, 0 0 0px white;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'expanded',
      value: false
    },
    {
      class: 'Int',
      name: 'level'
    }
  ],

  methods: [
    function initE() {
      var view = this;

      var paddingLeft = view.level * 10 + 15;
      var fontSize = view.level * -1 + 18;
      var opacity = view.level * -0.1 + 0.9;

      this
        .addClass(`${this.myClass()}-level-${this.level}`)
        .start('a')
          .add(this.data.label)
          .enableClass(this.myClass('selected'), view.currentMenu$.map(function (value) {
            return view.currentMenu.id === (view.data.id);
          }))
          .style({'padding-left': paddingLeft +  'px', 'font-size': fontSize + 'px', 'opacity': opacity})
          .on('click', this.onClick)
        .end()
        .add(this.slot(function(expanded, data) {
          return ! expanded ?
            this.E() :
            this.E()
              .select(data.children.orderBy(view.Menu.ORDER), function(child) {
                return view.cls_.create({ data: child, level: view.level + 1 }, view);
              });
            }))
          .end();
      },

      function setAnchor(menu) {
        setTimeout( () => {
          var names = document.getElementsByName(menu.handler.anchor);
          if ( names.length > 0 ) {
            names[0].scrollIntoView();
          }
        }, 500);
      },

      function handleClick(menu) {
        var self = this;

        if ( menu.handler != 'foam.nanos.menu.SubMenu' ) {
          if ( menu.handler == 'foam.nanos.menu.DocumentFileMenu' ) {
            if ( this.currentMenu.handler != 'foam.nanos.menu.DocumentFileMenu' || (this.currentMenu.handler == 'foam.nanos.menu.DocumentFileMenu' && this.currentMenu.handler.docKey != menu.handler.docKey) ) {
              menu.launch(this.__context__, this);
            }
            if ( menu.handler.anchor ) {
              this.setAnchor(menu);
            }
          } else if ( this.currentMenu.id !== menu.id ) {
            menu.launch(this.__context__, this);
          }
        }

        this.expanded = ! this.expanded;
      }
    ],

    listeners: [
      function onClick() {
        this.handleClick(this.data);
      }
    ]
  });
