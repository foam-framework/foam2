foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'SideNavigationItemView',
  extends: 'foam.u2.View',

  imports: [
    'currentMenu',
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
      value: true
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
        .addClass(this.myClass())
        .start('a')
          .add(this.data.label)
          .enableClass(this.myClass('selected'), view.currentMenu$.map(function (value) {
            return view.currentMenu.id === (view.data.id);
          }))
          .style({'padding-left': paddingLeft +  'px', 'font-size': fontSize + 'px', 'opacity': opacity})
          .on('click', function() {
            var menu = view.data;
            if (menu.handler != 'foam.nanos.menu.SubMenu' && (view.currentMenu.id !== menu.id)) {
              if (menu.handler == 'foam.nanos.menu.LinkMenu') {
                view.setAnchor(menu.handler.link.substring(1));
              } else {
                menu.launch(view.__context__, view);
              }
            } 
            view.expanded = ! view.expanded;
          })
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

      function setAnchor(name) {
        var names = document.getElementsByName(name);
        if (names.length > 0) {
          document.getElementsByName(name)[0].scrollIntoView();
        }
      }
    ]
  });
