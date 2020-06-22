/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'FormattedTextField',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
  ],

  css: `
    ^ {
      display: flex;
    }

    ^container-selection {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;

      box-sizing: border-box;
      width: 64px;
      height: 30px;

      border: 1px solid /*%GREY3%*/ #cbcfd4;
      border-right: none;
      border-radius: 3px 0 0 3px;
    }

    ^container-selection p {
      margin: 0;
    }

    ^container-input {
      box-sizing: border-box;
      flex: 1;
      height: 30px;

      font-size: 14px;

      border: 1px solid /*%GREY3%*/ #cbcfd4;
      border-left: none;
      border-radius: 0 3px 3px 0;
    }
  `,

  properties: [
    {
      name: 'prop'
    },
    {
      class: 'String',
      name: 'valueString',
      documentation: 'This is the front facing formatted value',
      factory: function() {
        return this.data || '';
      },
      preSet: function(_, v) {
        var sanitized = this.sanitizeString(v);
        this.data = sanitized;
        var formatted = this.prop.tableCellFormatter.f(
          sanitized, this.prop);
        return formatted;
      },
      view: {
        class: 'foam.u2.tag.Input',
        onKey: true
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.addClass(this.myClass())
        .add(this.slot(function(mode) {
          if ( mode === foam.u2.DisplayMode.RW ) {
            return this.E().style({ 'display': 'flex' })
            .startContext({ data: self })
              .start(self.VALUE_STRING).addClass(self.myClass('container-input'))
              .end()
            .endContext();
          }
        }));
    },
    function fromProperty(prop) {
      this.SUPER(prop);

      this.prop = prop;
    },
    // TODO: move this to property of foam.core.String
    function sanitizeString(s) {
      return s.replace(/[\s\._\-\/]+/g, "");
    }
  ],
})

