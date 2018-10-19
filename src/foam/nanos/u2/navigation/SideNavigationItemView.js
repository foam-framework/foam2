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
  
        this
          .start('a')
            .add(this.data.label)
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
          .start('div')
            .style({'margin-left': '30px'})
            .add(this.slot(function(expanded, data) {
              return ! expanded ?
                this.E() :
                this.E()
                  .select(data.children, function(child) {
                    return view.cls_.create({ data: child }, view);
                  });
            }))
          .end();
      }
    ]
  });
