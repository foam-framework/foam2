/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'RichChoiceView',
  extends: 'foam.u2.View',

  documentation: `
    This is similar to foam.u2.view.ChoiceView, but lets you provide views for
    the selection and options instead of strings. This allows you to create
    dropdowns with rich content like images and formatting using CSS.

    Example usage for a Reference property on a model:

      {
        class: 'Reference',
        of: 'foam.nanos.auth.User',
        name: 'exampleProperty',
        view: function(_, X) {
          return {
            class: 'foam.u2.view.RichChoiceView',
            selectionView: { class: 'a.b.c.MyCustomSelectionView' }, // Optional
            rowView: { class: 'a.b.c.MyCustomCitationView' }, // Optional
            sections: [
              {
                heading: 'Users',
                dao: X.userDAO.orderBy(foam.nanos.auth.User.LEGAL_NAME)
              },
              // Set "disabled: true" to render each object as non-selectable row
              // Set hideIfEmpty: true" to hide headers if not objects are present in dao provided.
              {
                disabled: true,
                heading: 'Disabled users',
                hideIfEmpty: true,
                dao: X.userDAO.where(this.EQ(foam.nanos.auth.User.STATUS, this.AccountStatus.DISABLED)),
              },
            ]
          };
        }
      }
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  exports: [
    'of'
  ],

  css: `
    ^ {
      position: relative;
      display: inline-block;
    }

    ^container {
      position: absolute;
      bottom: 0;
      left: 0;
      transform: translateY(100%);
      background: white;
      border: 1px solid #bdbdbd;
      max-height: 378px;
      overflow-y: scroll;
      box-sizing: border-box;
      width: 100%;
      min-width: fit-content;
      -webkit-appearance: textfield;
    }

    ^heading {
      border-bottom: 1px solid #f4f4f9;
      font-size: 12px;
      font-weight: 900;
      padding: 1px 2px;
    }

    ^selection-view {
      background-color: white;
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      box-sizing: border-box;
      -webkit-appearance: textfield;
      padding: 1px 2px;
      cursor: default;
      border: 1px solid;
      min-width: 94px;
    }

    ^chevron::before {
      content: '▾';
      padding-left: 4px;
    }

    ^custom-selection-view {
      flex-grow: 1;
    }

    ^ .search input {
      width: 100%;
      border: none;
      border-bottom: 1px solid #f4f4f9;
    }

    ^ .search input:focus {
      border: none;
    }

    ^ .search img {
      width: 15px;
      position: absolute;
      left: 10px;
      top: 13px;
    }

    ^ .search {
      border-bottom: 1px solid #f4f4f9;
    }

    ^ .property-filter_ {
      padding-left: 25px;
    }

    ^ .disabled {
      filter: grayscale(100%) opacity(60%);
    }

    ^ .disabled:hover {
      cursor: default;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'name',
      factory: function() { return "select"; }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'rowView',
      documentation: `
        Set this to override the default view used for each row. It will be
        instantiated with an object from the DAO as the 'data' property.
      `,
      factory: function() {
        return this.DefaultRowView;
      }
    },
    {
      name: 'data',
      documentation: `
        The value that gets chosen. This is set whenever a user makes a choice.
      `
    },
    {
      class: 'Boolean',
      name: 'isOpen_',
      documentation: `
        An internal property used to determine whether the options list is
        visible or not.
      `
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'selectionView',
      documentation: `
        Set this to override the default view used for the input content. It
        will be instantiated with an object from the DAO as the 'fullObject'
        property and that object's id as the 'data' property.
      `,
      factory: function() {
        return this.DefaultSelectionView;
      }
    },
    {
      class: 'Array',
      name: 'sections',
      documentation: `
        This lets you pass different predicated versions of a dao in different
        sections, which can be used to do things like grouping by some property
        for each section.
        Each object in the array must have a 'label' property of type string
        which will be used for the section heading, and a 'dao' property of type
        DAO that will be used to populate the list in that section.
      `,
    },
    {
      class: 'FObjectProperty',
      name: 'of',
      documentation: 'The model stored in the DAO. Used intenrally.',
      expression: function(sections) {
        return sections[0].dao.of;
      }
    },
    {
      class: 'FObjectProperty',
      name: 'fullObject_',
      documentation: `
        The full object from the DAO. This property is only used internally, you
        do not need to set it as a consumer of this view.
      `
    },
    {
      class: 'Boolean',
      name: 'search',
      documentation: 'Set to true to enable searching.'
    },
    {
      class: 'String',
      name: 'filter_',
      documentation: 'The text that the user typed in to search by.',
      postSet: function(oldValue, newValue) {
        this.sections = this.sections.map((section) => {
          return Object.assign({}, section, {
            filtered: newValue
              ? section.dao.where(this.KEYWORD(newValue))
              : section.dao
          });
        });
      }
    },
    {
      class: 'String',
      name: 'searchPlaceholder',
      documentation: 'Replaces search box placeholder with passed in string.',
      value: 'Search...'
    },
    {
      type: 'Action',
      name: 'action',
      documentation: `
        Optional. If this is provided, an action will be included at the bottom
        of the dropdown.
      `
    }
  ],

  methods: [
    function initE() {
      var self = this;

      if ( ! Array.isArray(this.sections) || this.sections.length === 0 ) {
        throw new Error(`You must provide an array of sections. See documentation on the 'sections' property in RichTextView.js.`);
      }

      // If the property that this view is for already has a value when being
      // rendered, the 'data' property on this model will be set to an id for
      // the object being referenced by the Reference property being rendered.
      // Custom views might need the full object to render though, not just the
      // id, so we do a lookup here for the full object here. This then gets
      // passed to the selectionView to use it if it wants to.
      if ( this.data ) {
        this.sections[0].dao.find(this.data).then((result) => {
          this.fullObject_ = result;
        });
      }

      this
        .attrs({ name: this.name })
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('selection-view'))
          .enableClass('disabled', this.mode$.map((mode) => mode === foam.u2.DisplayMode.DISABLED))
          .on('click', function() {
            if ( self.mode === foam.u2.DisplayMode.RW ) {
              self.isOpen_ = ! self.isOpen_;
            }
          })
          .start()
            .addClass(this.myClass('custom-selection-view'))
            .add(this.slot((data) => {
              return this.E().tag(self.selectionView, {
                data: data,
                fullObject$: this.fullObject_$
              });
            }))
          .end()
          .start()
            .addClass(this.myClass('chevron'))
          .end()
        .end()
        .start()
          .addClass(this.myClass('container'))
          .show(self.isOpen_$)
          .add(self.search$.map((searchEnabled) => {
            if ( ! searchEnabled ) return null;
            return this.E()
              .start()
                .start('img')
                  .attrs({ src: 'images/ic-search.svg' })
                .end()
                .startContext({ data: self })
                  .addClass('search')
                  .add(self.FILTER_.clone().copyFrom({ view: {
                    class: 'foam.u2.view.TextField',
                    placeholder: this.searchPlaceholder,
                    onKey: true
                  } }))
                .endContext()
              .end();
          }))
          .add(this.slot(function(sections) {
            var promiseArray = [];
            sections.forEach(function(section) {
              promiseArray.push(section.dao.select(self.COUNT()));
            });

            return Promise.all(promiseArray).then((resp) => {
              var index = 0;
              return this.E().forEach(sections, function(section) {
                this
                  .start().hide(!! section.hideIfEmpty && resp[index].value <= 0 || ! section.heading)
                    .addClass(self.myClass('heading'))
                    .add(section.heading)
                  .end()
                  .start()
                    .select(section.filtered || section.dao, (obj) => {
                      return this.E()
                        .start(self.rowView, { data: obj })
                          .enableClass('disabled', section.disabled)
                          .callIf(! section.disabled, function() {
                            this.on('click', () => {
                              self.fullObject_ = obj;
                              self.data = obj.id;
                              self.isOpen_ = false;
                            });
                          })
                        .end();
                    })
                  .end();
                  index++;
              });
            });
          }))
          .add(this.slot(function(action) {
            if ( action ) {
              return this.E()
                .start(self.DefaultActionView, { action: action })
                  .addClass(self.myClass('action'))
                .end();
            }
          }))
        .end();
    },

    function updateMode_(mode) {
      if ( mode !== foam.u2.DisplayMode.RW ) {
        this.isOpen_ = false;
      }
    }
  ],

  classes: [
    {
      name: 'DefaultRowView',
      extends: 'foam.u2.View',

      documentation: `
        This is the view that gets rendered for each item in the list.
      `,

      css: `
        ^row {
          background: white;
          padding: 1px 2px;
          font-size: 12px;
        }

        ^row:hover {
          background: #f4f4f9;
          cursor: pointer;
        }
      `,

      properties: [
        {
          name: 'data',
          documentation: 'The selected object.'
        }
      ],

      methods: [
        function initE() {
          return this
            .start()
              .addClass(this.myClass('row'))
              .add(this.data.id)
            .end();
        }
      ]
    },
    {
      name: 'DefaultSelectionView',
      extends: 'foam.u2.Element',

      documentation: `
        This is the view that gets rendered inside the select input. It is put
        to the left of the chevron (the triangle at the far right side of the
        select input). This is an Element instead of a simple string, meaning
        the select input can contain "rich" content like images and make use of
        CSS for styling and layout.
        As an example of why this is useful, imagine you wanted to show a
        dropdown to select a country. You could choose to display the flag of
        the selected country alongside its name after the user makes a
        selection by creating that custom view and providing it in place of this
        one by setting the selectionView property on RichChoiceView.
      `,

      imports: [
        'of'
      ],

      messages: [
        {
          name: 'CHOOSE_FROM',
          message: 'Choose from '
        }
      ],

      properties: [
        {
          name: 'data',
          documentation: 'The id of the selected object.'
        },
        {
          name: 'fullObject',
          documentation: `
            The full object. It's not used here in the default selection view,
            but this property is included to let you know that if you create a
            custom selection view, it will be passed the id of the object (data)
            as well as the full object.
          `
        }
      ],

      methods: [
        function initE() {
          var plural = this.of.model_.plural.toLowerCase();
          return this.add(this.data || this.CHOOSE_FROM + plural);
        }
      ]
    },
    {
      name: 'DefaultActionView',
      extends: 'foam.u2.ActionView',

      documentation: `
        This is the view that gets rendered at the bottom of the dropdown if an
        action is provided.
      `,

      inheritCSS: false,
      css: `
        ^ {
          border: 0;
          border-top: 1px solid #f4f4f9;
          color: %SECONDARYCOLOR%;
          display: flex;
          font-size: 12px;
          text-align: left;
          width: 100%;
        }

        ^:hover {
          cursor: pointer;
          color: %SECONDARYHOVERCOLOR%;
        }

        ^ img + span {
          margin-left: 6px;
        }
      `
    }
  ]
});
