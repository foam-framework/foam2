foam.CLASS({
    package: 'foam.nanos.u2.navigation',
    name: 'SideNavigation',
    extends: 'foam.u2.View',
  
    documentation: 'Side navigation bar',
  
    implements: [
        'foam.mlang.Expressions'
      ],
       requires: [
        'foam.nanos.menu.Menu'
      ],
       imports: [
        'menuDAO'
      ],
       css: `
        ^ .side-nav {
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
        ^ .nav-row {
          display: block;
        }
        ^ .side-nav a {
          display: inline-block;
          margin: 8px 8px 8px 8px;
          text-decoration: none;
          font-size: 20px;
          transition: 0.3s;
        }
        ^ .side-nav a:hover {
          color: #f1f1f1;
        }
        ^ .accordion-card a {
          font-size: 16px;
          margin: 8px 8px 8px 50px;
        }
        ^ .accordion-card-hide {
          display: none;
        }
        ^ .accordion-card-show {
          display: block !important;
        }
        ^ .accordion-button {
          display: inline-block;
          border: none;
          padding: 0;
          margin: 8px 8px;
          font-size: 20px;
          overflow: hidden;
          text-decoration: none;
          text-align: left;
          cursor: pointer;
          white-space: nowrap;
        }
        ^ .accordion-button:focus {
          outline: 0;
        }
      `,
       properties: [
        {
          name: 'accordionCardShowDict',
          value: {}
        },
        {
          class: 'Boolean',
          name: 'accordionCardShow',
          value: true
        },
        {
          class: 'String',
          name: 'menuName',
        }
      ],
       methods: [
        function initE() {
          var Menu = this.Menu;
          var self = this;
          var dao = this.menuDAO.orderBy(Menu.ORDER)
              .where(this.EQ(Menu.PARENT, this.menuName));
              this.addClass(this.myClass())
              .start().addClass('side-nav')
                .select(dao, function(menu) {
                  self.accordionCardShowDict[menu.id] = true;
                  return this.E()
                    .call(function() {
                      var self2 = this;
                      this
                        .start('a').addClass('menuItem')
                          .add(menu.label)
                          .on('click', function() {
                            menu.children.select().then(function(temp) {
                              // Only display submenu if array length is longer than 0
                              temp.array.length === 0 ?
                                menu.launch(self2.__context__, self2) :
                                self.accordianToggle(menu.id);
                            });
                          })
                        .end();
                       // Genearete submenu
                      var X = this.__subContext__;
                      self.menuDAO.where(ctrl.EQ(Menu.PARENT, menu.id)).select(
                        function(submenu) {
                          var accordianSlot = self.accordionCardShowDict$.map(
                            function( keypair ) {
                              return keypair[submenu.parent];
                            }
                          );
                          self2.start()
                            .addClass('accordion-card')
                            .addClass('accordion-card-hide')
                            .enableClass('accordion-card-show',
                            accordianSlot)
                            .call(function() {
                              this.start('a').add(submenu.label)
                              .on('click', function() {
                                submenu.launch_(X, self2);
                              }).end();
                            })
                          .end();
                        }
                      );
                    });
                })
              .end();
          },
           function accordianToggle(menuId) {
            var oldDict = this.accordionCardShowDict;
            oldDict[menuId] = ! oldDict[menuId];
            // accordianSlot won't be triggered if removed the next line
            this.accordionCardShowDict = undefined;
            this.accordionCardShowDict = oldDict;
          }
        ]
      });