/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'RichChoiceViewI18NComparator',

  imports: [
    'translationService?'
  ],

  methods: [
    function compare(o1, o2) {
      var k1 = this.key(o1);
      var k2 = this.key(o2);
      return foam.util.compare(k1, k2);
    },
    function key(o) {
      var k = o.toSummary ? o.toSummary() : o.id;
      if ( this.translationService ) {
        k = this.translationService.getTranslation(foam.locale, k, k);
      }
      return k;
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.view',
  name: 'RichChoiceViewSection',

  documentation: 'Models one section of the dropdown for a RichChoiceView.',

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      documentation: 'The DAO that will be used to populate the options in this section.'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'filteredDAO',
      documentation: 'A filtered version of the underlying DAO, depending on the search term the user has typed in.',
      expression: function(dao) { return dao; }
    },
    {
      class: 'Array',
      name: 'searchBy',
      documentation: 'An array of PropertyInfos to reduce the filter scope by. If empty or not set, revert to KEYWORD lookup.'
    },
    {
      class: 'Boolean',
      name: 'hideIfEmpty',
      documentation: 'This section will be hidden if there are no items in it if this is set to true.'
    },
    {
      class: 'Boolean',
      name: 'disabled',
      documentation: 'Rows in this section will not be selectable if this is set to true.'
    },
    {
      class: 'String',
      name: 'heading',
      documentation: 'The heading text for this section.'
    }
  ]
});


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

  imports: [
    'window'
  ],

  exports: [
    'of'
  ],

  messages: [
    {
      name: 'CHOOSE_FROM',
      message: 'Choose from'
    },
    {
      name: 'CLEAR_SELECTION',
      message: 'Clear'
    }
  ],

  css: `
    ^ {
      display: inline-block;
      position: relative;
    }

    ^setAbove {
      z-index: 1;
    }

    ^container {
      position: absolute;
      bottom: -4px;
      left: 0;
      transform: translateY(100%);
      background: white;
      border: 1px solid /*%GREY3%*/ #cbcfd4;
      max-height: 378px;
      overflow-y: auto;
      box-sizing: border-box;
      width: 100%;
      min-width: fit-content;
      border-radius: 3px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 2px 8px 0 rgba(0, 0, 0, 0.16);
    }

    ^heading {
      border-bottom: 1px solid #f4f4f9;
      font-size: 12px;
      font-weight: 900;
      padding: 1px 2px;
    }

    ^selection-view {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;

      height: /*%INPUTHEIGHT%*/ 32px;
      font-size: 14px;
      padding-left: /*%INPUTHORIZONTALPADDING%*/ 8px;
      padding-right: /*%INPUTHORIZONTALPADDING%*/ 8px;
      border: 1px solid;
      border-radius: 3px;
      color: /*%BLACK%*/ #1e1f21;
      background-color: white;
      border-color: /*%GREY3%*/ #cbcfd4;
      box-sizing: border-box;
      cursor: default;
      min-width: 94px;
    }

    ^selection-view:hover,
    ^selection-view:hover ^clear-btn {
      border-color: /*%GREY2%*/ #9ba1a6;
    }

    ^:focus {
      outline: none;
    }

    ^:focus ^selection-view,
    ^:focus ^selection-view ^clear-btn {
      border-color: /*%PRIMARY3%*/ #406dea;
    }

    ^chevron::before {
      content: '▾';
      padding-left: 4px;
    }

    ^custom-selection-view {
      flex-grow: 1;
      overflow: hidden;
    }

    ^ .search .property-filter_ {
      width: 100%;
    }

    ^ .search input {
      width: 100%;
      border: none;
      padding-left: /*%INPUTHORIZONTALPADDING%*/ 8px;
      padding-right: /*%INPUTHORIZONTALPADDING%*/ 8px;
      height: /*%INPUTHEIGHT%*/ 32px;
    }

    ^ .search img {
      width: 15px;
      margin-left: 8px;
    }

    ^ .search {
      border-bottom: 1px solid #f4f4f9;
      display: flex;
    }

    ^ .disabled {
      filter: grayscale(100%) opacity(60%);
    }

    ^ .disabled:hover {
      cursor: default;
    }

    ^clear-btn {
      display: flex;
      align-items: center;
      border-left: 1px;
      padding-left: /*%INPUTHORIZONTALPADDING%*/ 8px;
      padding-right: /*%INPUTHORIZONTALPADDING%*/ 8px;
      height: /*%INPUTHEIGHT%*/ 32px;
      border-left: 1px solid;
      border-color: /*%GREY3%*/ #cbcfd4;
      margin-left: 12px;
      padding-left: 16px;
    }

    ^clear-btn:hover {
      color: /*%DESTRUCTIVE3%*/ #d9170e;
      cursor: pointer;
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
      name: 'clearOnReopen',
      documentation: 'clear filter on dropdown reopen if set to true',
      value: true
    },
    {
      class: 'Boolean',
      name: 'isOpen_',
      documentation: `
        An internal property used to determine whether the options list is
        visible or not.
      `,
      postSet: function(_, nv) {
        if ( nv && ! this.hasBeenOpenedYet_ ) this.hasBeenOpenedYet_ = true;
        if ( ! nv && this.clearOnReopen ) {
          this.clearProperty('filter_');
          this.sections.forEach((section) => {
            section.clearProperty('filteredDAO');
          });
        }
      }
    },
    {
      class: 'Boolean',
      name: 'hasBeenOpenedYet_',
      documentation: `
        Used internally to keep track of whether the dropdown has been opened
        yet or not. We don't want to waste resources pulling from the DAO until
        we know the user is going to interact with this dropdown.
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
      class: 'FObjectArray',
      of: 'foam.u2.view.RichChoiceViewSection',
      name: 'sections',
      documentation: `
        This lets you pass different predicated versions of a dao in different
        sections, which can be used to do things like grouping by some property
        for each section.
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
        this.sections.forEach((section) => {
          if ( newValue ) {
            if ( section.searchBy.length > 0 ) {
              var arrOfExpressions = section.searchBy.map((prop) => this.CONTAINS_IC(prop, newValue));
              var pred = this.Or.create({ args: arrOfExpressions });
            }
            else {
              var pred = this.KEYWORD(newValue);
            }
            section.filteredDAO = section.dao.where(pred);
          }
          else {
            section.filteredDAO = section.dao;
          }
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
      class: 'String',
      name: 'choosePlaceholder',
      documentation: 'Replaces choose from placeholder with passed in string.',
      expression: function(of) {
        var plural = of.model_.plural.toLowerCase();
        return this.CHOOSE_FROM + ' ' + plural + '...';
      }
    },
    {
      type: 'Action',
      name: 'action',
      documentation: `
        Optional. If this is provided, an action will be included at the bottom
        of the dropdown.
      `
    },
    {
      class: 'FObjectProperty',
      name: 'actionData',
      documentation: `
        Optional. If this is provided alongside an action, the action will be executed
        with this data in the context.
      `
    },
    {
      class: 'Boolean',
      name: 'allowClearingSelection',
      documentation: `
        Set to true if you want the user to be able to clear their selection.
      `
    },
    {
      name: 'comparator',
      documentation: 'Optional comparator for ordering choices.'
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
      this.onDetach(this.data$.sub(this.onDataUpdate));
      this.onDataUpdate();

      // Set up an event listener on the window so we can close the dropdown
      // when the user clicks somewhere else.
      var containerU2Element;
      const fn = function(evt) {
        // This prevents a console error when opening the dropdown.
        if ( containerU2Element === undefined ) return;

        var selfDOMElement = self.el();
        var containerDOMElement = containerU2Element.el();

        // If an ancestor U2 Element was removed but didn't properly detach us,
        // then the DOM elements will be removed but the listener will still be
        // in place. Here we detect such a situation and remove the listener if
        // it arises, preventing a memory leak.
        if ( selfDOMElement == null || containerDOMElement == null ) {
          self.window.removeEventListener('click', fn);
          return;
        }

        var selfRect = selfDOMElement.getClientRects()[0];
        var containerRect = containerDOMElement.getClientRects()[0];

        // This prevents a console error when making a selection.
        if ( containerRect === undefined ) return;

        if (
          ! (
              evt.clientX >= selfRect.x &&
              evt.clientX <= selfRect.x + selfRect.width &&
              evt.clientY >= selfRect.y &&
              evt.clientY <= containerRect.y + containerRect.height
            )
        ) {
          self.isOpen_ = false;
        }
      };
      this.window.addEventListener('click', fn);
      this.onDetach(() => this.window.removeEventListener('click', fn));

      this
        .add(this.slot(function(mode, fullObject_) {
          if ( mode !== foam.u2.DisplayMode.RO ) {
            return self.E()
              .attrs({
                name: this.name,
                tabindex: 0
              })
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
                      fullObject$: this.fullObject_$,
                      defaultSelectionPrompt$: this.choosePlaceholder$
                    });
                  }))
                .end()
                .start()
                  .addClass(this.myClass('chevron'))
                .end()
                .add(this.slot(function(allowClearingSelection) {
                  if ( ! allowClearingSelection ) return null;
                  return this.E()
                    .addClass(self.myClass('clear-btn'))
                    .on('click', self.clearSelection)
                    .add(self.CLEAR_SELECTION)
                }))
              .end()
              .add(this.slot(function(hasBeenOpenedYet_) {
                if ( ! hasBeenOpenedYet_ ) return this.E();
                return this.E()
                  .addClass(self.myClass('container'))
                  .call(function() { containerU2Element = this; })
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
                  .add(self.slot(function(sections) {
                    var promiseArray = [];
                    sections.forEach(function(section) {
                      promiseArray.push(section.dao.select(self.COUNT()));
                    });
                    return Promise.all(promiseArray).then((resp) => {
                      var index = 0;
                      return this.E().forEach(sections, function(section) {
                        this.addClass(self.myClass('setAbove'))
                          .start().hide(!! section.hideIfEmpty && resp[index].value <= 0 || ! section.heading)
                            .addClass(self.myClass('heading'))
                            .translate(section.heading, section.heading)
                          .end()
                          .start()
                            .select(section.filteredDAO$proxy, (obj) => {
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
                            }, false, self.comparator)
                          .end();
                          index++;
                      });
                    });
                  }))
                  .add(this.slot(function(action, actionData) {
                    if ( action && actionData) {
                      return this.E()
                        .startContext({ data: actionData })
                        .start(self.DefaultActionView, { action: action })
                          .addClass(self.myClass('action'))
                        .end()
                        .endContext();
                    }
                    if ( action ) {
                      return this.E()
                        .start(self.DefaultActionView, { action: action })
                          .addClass(self.myClass('action'))
                        .end();
                    }
                  }));
              }))
          } else {
            return self.E().add(fullObject_ ? fullObject_.toSummary() : '');
          }
        }))
    },

    function updateMode_(mode) {
      if ( mode !== foam.u2.DisplayMode.RW ) {
        this.isOpen_ = false;
      }
    },

    function fromProperty(property) {
      this.SUPER(property);
      this.prop = property;
    }
  ],

  listeners: [
    {
      name: 'onDataUpdate',
      code: function() {
        if ( this.data ) {
          this.sections[0].dao.find(this.data).then((result) => {
            this.fullObject_ = result;
          });
        }
      }
    },
    function clearSelection(evt) {
      evt.stopImmediatePropagation();
      this.fullObject_ = undefined;

      // If this view is being used for a property, then when the user clears
      // their selection we set the value back to the default value for that
      // property type. We can't simply set it to undefined because that
      // introduces a bug where it's impossible to update an object to set a
      // Reference property back to a default value, since a value of undefined
      // will cause the JSON outputter to ignore that property when performing
      // the put. Instead, we need to explicitly set the value to the default
      // value.
      this.data = this.prop ? this.prop.value : undefined;
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

      methods: [
        function initE() {
          var summary = this.data.toSummary();
          return this
            .start()
              .addClass(this.myClass('row'))
              .translate(summary || ('richChoiceSummary.' + this.data.cls_.id + '.' + this.data.id), summary)
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

      properties: [
        {
          name: 'data',
          documentation: 'The id of the selected object.',
        },
        {
          class: 'String',
          name: 'defaultSelectionPrompt'
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

          this.style({
            'overflow': 'hidden',
            'white-space': 'nowrap',
            'text-overflow': 'ellipsis'
          });

          return this.add(this.fullObject$.map(o => {
            return ( o && o.toSummary() ) || this.defaultSelectionPrompt;
          }));
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
          color: /*%PRIMARY3%*/ #406dea;
          display: flex;
          font-size: 12px;
          text-align: left;
          width: 100%;
        }

        ^:hover {
          color: /*%PRIMARY2%*/ #144794;
          cursor: pointer;
        }

        ^ img + span {
          margin-left: 6px;
        }
      `
    }
  ]
});
