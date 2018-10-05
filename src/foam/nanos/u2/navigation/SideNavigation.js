foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'SideNavigation',
  extends: 'foam.u2.View',
  
  documentation: 'Side navigation bar',
  
  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.menu.Menu',
    'foam.nanos.u2.navigation.SideNavigationItemView'
  ],

  imports: [
    'menuDAO'
  ],

  css:`
  ^side-nav {
    height: 100%;
    width: 200px;
    position
    z-index: 1;
    top: 0;
    left: 0;
    overflow-x: hidden;
    background-color: white;
    display: inline-block;
  }
  ^side-nav a {
    display: inline-block;
    margin: 8px 8px 8px 8px;
    text-decoration: none;
    font-size: 20px;
    transition: 0.3s;
  }
  `,

  properties: [
    {
      class: 'String',
      name: 'menuName',
    }
  ],

  methods: [
    function initE() {
      var self = this;
      var dao = this.menuDAO
        .orderBy(this.Menu.ORDER)
        .where(this.EQ(this.Menu.PARENT, this.menuName));
      this.addClass(this.myClass())
        .start()
          .addClass(this.myClass('side-nav'))
          .select(dao, function(menu) {
            // console.log('menu.label: ' + menu.label)
            return foam.nanos.u2.navigation.SideNavigationItemView.create({ data: menu });
          })
        .end();
    }
  ]
});

foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'SideNavigationItemView',
  extends: 'foam.u2.View',

  properties: [
    {
      class: 'Boolean',
      name: 'expanded',
      value: true
    }
  ],

  methods: [
    function initE() {
      var view = this;
      // console.log('label: ' + this.data.label + ' isSubMenu: ' + this.isSubMenu )

      this
        .start('a')
          .add(this.data.label)
          .on('click', function() {
            var menu = view.data;
            menu.children.select().then(function(c) {
              if ( c.array.length === 0 ) {
                // console.log('expanded: ' + view.expanded + ' length: 0' + ' submenu: ' + view.isSubMenu)
                menu.launch(view.__context__, view);
              } else {
                // console.log('expanded: ' + view.expanded + ' array: ' + c.array[0].label + " " + c.array[1].label + ' submenu: ' + view.isSubMenu)
                view.expanded = ! view.expanded;
              }
            });
          })
        .end()
        .start('div')
          .add(this.slot(function(expanded, data) {
            return ! expanded ?
              this.E() :
              this.E()
                .select(data.children, function(child) {
                  return view.cls_.create({ data: child }, view).style({'margin-left': '30px'});
                });
          }))
        .end();
    }
  ]
})