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
  
  `,

  exports: [
    'of'
  ],

  css: `
    ^container {
      background: white;
      border: 1px solid #bdbdbd;
      border-radius: 4px;
      max-width: 488px;
      max-height: 378px;
      overflow-y: scroll;
      box-sizing: border-box;
    }

    ^heading {
      font-weight: bold;
      border-bottom: 1px solid #f4f4f9;
      line-height: 24px;
      font-size: 14px;
      color: #333;
      font-weight: 900;
      padding: 6px 16px;
    }

    ^button {
      height: 36px;
      width: 488px;
      border-radius: 4px;
      border: solid 1px #bdbdbd;
      background-color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 8px;
      font-size: 12px;
      box-sizing: border-box;
      margin-bottom: 4px;
    }

    ^chevron::before {
      content: '▾';
      color: #bdbdbd;
      font-size: 17px;
      padding-left: 8px;
    }

    ^custom-button {
      flex-grow: 1;
    }
  `,

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'rowView',
      value: { class: 'foam.u2.CitationView' }
    },
    {
      name: 'data',
      documentation: `` // TODO
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
      name: 'buttonContentView',
      factory: function() {
        return this.DefaultButtonContentView;
      }
    },
    {
      class: 'Array',
      name: 'sections',
      documentation: '' // TODO
    },
    {
      class: 'FObjectProperty',
      name: 'of',
      expression: function(sections) {
        if ( ! Array.isArray(sections) || sections.length === 0 ) {
          return null;
        }
        return ctrl.__subContext__[sections[0].dao].of; // FIXME
      }
    },
    {
      class: 'FObjectProperty',
      name: 'fullObject'
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('button'))
          .on('click', function() {
            self.isOpen_ = ! self.isOpen_;
          })
          .start()
            .addClass(this.myClass('custom-button'))
            .add(this.slot((data) => {
              return this.E().tag(self.buttonContentView, {
                data: data,
                fullObject: this.fullObject
              }));
            }))
          .end()
          .start()
            .addClass(this.myClass('chevron'))
          .end()
        .end()
        .start()
          .addClass(this.myClass('container'))
          .show(self.isOpen_$)
          .forEach(this.sections, function(section) {
            var dao = ctrl.__subContext__[section.dao]; // FIXME
            this
              .start()
                .addClass(self.myClass('heading'))
                .add(section.heading)
              .end()
              .start()
                .select(dao, function(obj) {
                  return this.E()
                    .start(self.rowView, { data: obj })
                      .on('click', () => {
                        self.fullObject = obj;
                        self.data = obj;
                        self.isOpen_ = false;
                      })
                    .end();
                })
              .end();
          })
        .end();
    }
  ],

  classes: [
    {
      name: 'DefaultButtonContentView',
      extends: 'foam.u2.Element',

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
          name: 'data'
        }
      ],

      methods: [
        function initE() {
          var plural = this.of.model_.plural.toLowerCase();
          return this.add(this.data || this.CHOOSE_FROM + plural);
        }
      ]
    }
  ]
});
