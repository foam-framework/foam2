foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'SideNavigationItemView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'currentMenu',
    'menuDAO'
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

      function handleClick(menu) {
        var self = this;
        if ( menu.handler != 'foam.nanos.menu.SubMenu' && this.currentMenu.id !== menu.id ) {
          if ( menu.handler == 'foam.nanos.menu.LinkMenu' ) {
            var names = document.getElementsByName(menu.handler.link.substring(1));
            if ( names.length > 0 ) { // found in currently loaded document
              names[0].scrollIntoView();
            } else { // not in currently loaded document, need to check if a parent menu contains the element
              this.select(this.menuDAO.orderBy(this.Menu.ORDER).limit(1).where(this.EQ(this.Menu.ID, menu.parent)), function(parent) {
                if ( this.currentMenu.id !== parent.id ) {
                  self.handleClick(parent);
                  setTimeout( () => {
                    self.handleClick(menu);
                  }, 100);
                }
              });
            }
          } else {
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
