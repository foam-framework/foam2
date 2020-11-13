/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.boot',
  name: 'DAOConfigSummaryView',
  extends: 'foam.u2.Controller',

  documentation: 'Data Management UI for browsing all DAOs.',

  classes: [
    {
      name: 'CustomDAOUpdateView',
      extends: 'foam.comics.v2.DAOUpdateView',

      properties: [
        {
          class: 'foam.u2.ViewSpecWithJava',
          name: 'viewView',
          factory: function() {
            return {
              class: 'foam.u2.view.ObjAltView',
              views: [
                [ {class: 'foam.u2.DetailView'},                 'Detail' ],
                [ {class: 'foam.u2.detail.TabbedDetailView'},    'Tabbed' ],
                [ {class: 'foam.u2.detail.SectionedDetailView'}, 'Sectioned' ],
                [ {class: 'foam.u2.md.DetailView'},              'Material' ]
              ]
            };
          }
        }
      ]
    },

    // TODO: replace with UpdateView
    {
      name: 'CustomDAOSummaryView',
      extends: 'foam.comics.v2.DAOSummaryView',

      properties: [
        {
          class: 'foam.u2.ViewSpecWithJava',
          name: 'viewView',
          factory: function() {
            return {
              class: 'foam.u2.view.ObjAltView',
              views: [
                [ {class: 'foam.u2.DetailView'},                 'Detail' ],
                [ {class: 'foam.u2.detail.TabbedDetailView'},    'Tabbed' ],
                [ {class: 'foam.u2.detail.SectionedDetailView'}, 'Sectioned' ]
              ]
            };
          }
        }
      ]
    },

    {
      name: 'DAOUpdateControllerView',
      extends: 'foam.comics.DAOUpdateControllerView',

      documentation: 'Same as regular UpdateController except it starts in EDIT mode',

      properties: [
        {
          name: 'controllerMode',
          factory: function() {
            return this.ControllerMode.EDIT;
          }
        }
      ]
    },

    {
      name: 'BackBorder',
      extends: 'foam.u2.Element',

      imports: [ 'memento', 'stack' ],

      css: `
        ^title {
          padding: 25px;
          font-size: 26px;
        }
        ^title a {
          color: blue;
          text-decoration: underline;
        }
      `,

      properties: [
        'title',
        {
          class: 'foam.u2.ViewSpec',
          name: 'inner'
        }
      ],

      methods: [
        function initE() {
          this.SUPER();

          this.
            start().
              addClass(this.myClass('title')).
              start('a').
                add('Data Management').on('click', () => { this.memento = ''; }).
              end().
              add(' / ', this.title).
            end().
            tag(this.inner);
        }
      ]
    }
  ],

  css: `
    ^ {
      padding: 6px;
    }
    ^dao, ^header {
      display: inline-block;
      font-size: smaller;
      margin: 2px;
      padding: 2px;
      width: 220px;
    }
    ^dao {
      color: #555;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    ^dao:hover {
      background: lightgray;
    }
    ^section {
      display: inline-grid;
    }
    ^header {
      background: /*%BLACK%*/ #1e1f21;
      color: white;
      font-weight: 800;
    }
    /* TODO: scope this better so it doesn't affect nested AltViews also */
    .foam-u2-view-AltView .property-selectedView {
      margin-left: 24px;
    }
  `,

  requires: [
    'foam.comics.BrowserView',
    'foam.comics.v2.DAOBrowseControllerView',
    'foam.nanos.boot.NSpec'
  ],

  implements: [ 'foam.mlang.Expressions' ],

  imports: [ 'memento', 'nSpecDAO', 'stack' ],

  properties: [
    {
      name: 'data',
      factory: function() {
       return this.nSpecDAO;
      }
    },
    {
      name: 'filteredDAO',
      factory: function() {
       return this.data.where(
         this.AND(
           this.ENDS_WITH(foam.nanos.boot.NSpec.ID, 'DAO'),
           this.EQ(foam.nanos.boot.NSpec.SERVE,     true)
         ));
      }
    },
    {
      class: 'String',
      name: 'search',
      view: {
       class: 'foam.u2.TextField',
       type: 'search',
       onKey: true
      }
    },
    'currentMemento_'
  ],

  methods: [
    function initE() {
      this.SUPER();

      var self          = this;
      var currentLetter = '';
      var section;

      this.addClass(this.myClass()).
      start().
        style({ 'height': '56px'}).
        start().
          style({ 'font-size': '26px', 'width': 'fit-content', 'float': 'left', 'padding-top': '10px' }).
          add('Data Management').
        end()
        .start()
        .style({ 'width': 'fit-content', 'float': 'right', 'margin-right': '40px', 'margin-top': '6px' })
            .start(this.SEARCH).focus().end()
            .addClass('foam-u2-search-TextSearchView')
            .addClass(this.myClass('foam-u2-search-TextSearchView'))
          .end()
        .end()
      .end();

      var updateSections = [];
      var i = 0;

      this.filteredDAO.select().then(function(specs) {
        specs.array.sort(function(o1, o2) { return foam.String.compare(o1.id.toUpperCase(), o2.id.toUpperCase())}).forEach(function(spec) {
          var label = foam.String.capitalize(spec.id.substring(0, spec.id.length-3));
          var l     = label.charAt(0);

          if ( l != currentLetter ) {
            let lSection;
            let showSection = foam.core.SimpleSlot.create({value: true});
            i = updateSections.length;

            var updateSlot = foam.core.SimpleSlot.create({value: false});
            updateSections.push(updateSlot);

            updateSections[i].sub(function() {
              // first child is a header
              for ( var j = 1 ; j < lSection.childNodes.length ; j++ ) {
                if ( lSection.childNodes[j].shown ) {
                  showSection.set(true);
                  return;
                }
              }
              showSection.set(false);
            });

            currentLetter = l;

            section = self.start('span')
              .show(showSection)
              .addClass(self.myClass('section'))
              .start('span')
                .addClass(self.myClass('header'))
                .add(l)
              .end();

            lSection = section;
          }

          var localI    = i.valueOf();
          var localShow = foam.core.SimpleSlot.create({value: true});

          section
            .start('span')
              .show(localShow)
              .addClass(self.myClass('dao'))
              .add(label)
              .attrs({title: spec.description})
              .on('click', function() { self.memento = spec.id; });

              self.search$.sub(function() {
                var contains = false;
                if ( ! self.search ) {
                  contains = true;
                } else if ( label.toLowerCase().includes(self.search.toLowerCase()) ) {
                  contains =  true;
                } else if ( ! contains && spec.keywords && spec.keywords.length > 0 ) {
                  for ( var k in spec.keywords ) {
                    if ( k.toLowerCase().includes(self.search.toLowerCase()) ) {
                      contains  = true;
                      break;
                    }
                  }
                }

                localShow.set(contains);
                updateSections[localI].set(! updateSections[localI].get());
              });
        });
      });

//      this.onDetach(this.memento$.sub(this.mementoChange));
      this.memento$.sub(this.mementoChange);
      this.mementoChange();
    }
  ],

  listeners: [
    function mementoChange() {
      var m = this.memento;

      if ( ! m ) {
        if ( this.currentMemento_ ) this.stack.back();
        this.currentMemento_ = '';
        return;
      }

      this.currentMemento_ = m;

      var x = this.__subContext__.createSubContext();
      x.register(this.DAOUpdateControllerView, 'foam.comics.DAOUpdateControllerView');
      x.register(this.CustomDAOSummaryView,    'foam.comics.v2.DAOSummaryView');
      x.register(this.CustomDAOUpdateView,     'foam.comics.v2.DAOUpdateView');
      x.register(foam.u2.DetailView,           'foam.u2.DetailView');

      this.stack.push({
        class: this.BackBorder,
        title: m,
        inner: {
          class: 'foam.u2.view.AltView',
          data: this.__context__[m],
          views: [
            [
              {
                class: this.DAOBrowseControllerView,
                stack: this.stack
              },
              'New Controller'
            ],
            [
              {
                class: this.BrowserView,
                stack: this.stack
              },
              'Old Controller'
            ]
          ]
        }
      }, x);
    }
  ]
});
