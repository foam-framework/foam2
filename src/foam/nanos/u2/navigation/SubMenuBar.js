
foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'SubMenuBar',
  extends: 'foam.u2.Element',

  documentation: 'Childrens menu dropdown',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 100px;
          vertical-align: top;
        }
        ^ ul{
          margin-top: 20px;
          font-size: 13px;
          list-style-type: none;
        }
        ^ li{
          margin-top: 25px;
        }
        .highlight{
          background: blue;
        }
      */}
    })
  ],

  properties: [
    'data',
    'parent'
  ],

  methods: [
    function initE(){
      var self   = this;
      var menus  = self.data;
      var parent = self.parent;

      this
          .addClass(this.myClass())
            .start()
              .start('ul')
                .forEach(this.filterSubMenus(menus, parent), function(i){
                  this.start('li')
                    .add(i.label)
                    .on('click', function() {
                      if(!i.selected){
                        self.selected = true;
                        self.tag({class: 'foam.u2.navigation.SubMenuBar', data: menus, parent: i })
                      }
                    })
                  .end()
                })
              .end()
            .end()
          .end();
    },

    function filterSubMenus(menus, parent){
      var subMenus = menus.filter(function(obj){
        return obj.parent == parent.id
      })

      return subMenus;
    }
  ]
});
