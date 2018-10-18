foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'SideNavigationItemView',
  extends: 'foam.u2.View',

  imports: [
    'currentMenu',
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
      name: 'paddingLeft'
    },
    {
      class: 'Int',
      name: 'fontSize'
    },
    {
      class: 'Float',
      name: 'opacity'
    }
  ],

  methods: [
    function initE() {
      var view = this;

      this
        .addClass(this.myClass())
        .start('a')
          .add(this.data.label)
          .enableClass(this.myClass('selected'), view.currentMenu$.map(function (value) {
            return window.location.hash.substring(1) === (view.data.id);
          }))
          .style({'padding-left': view.paddingLeft + 'px', 'font-size': view.fontSize + 'px', 'opacity': view.opacity})
          .on('click', function() {
            var menu = view.data;
            menu.children.select().then(function(c) {
              if ( c.array.length === 0 ) {
                menu.launch(view.__context__, view);
              } else {
                view.expanded = ! view.expanded;
              }
            });
          })
        .end()
        .add(this.slot(function(expanded, data) {
          return ! expanded ?
            this.E() :
            this.E()
              .select(data.children, function(child) {
                return view.cls_.create({ data: child, paddingLeft: view.paddingLeft + 10, fontSize: view.fontSize - 1, opacity: view.opacity - 0.1 }, view);
              });
        }));
    }
  ]
});
