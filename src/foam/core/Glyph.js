/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core',
  name: 'Glyph',

  imports: ['theme?'],

  documentation: `
    A glyph is a vector that can be passed colour parameters
  `,

  properties: [
    {
      name: 'template',
      class: 'String',
      expression: function(themeName) {
        if ( ! this.theme ) return '';
        return this.theme.glyphs[themeName].template;
      }
    },
    {
      name: 'themeName',
      class: 'String'
    }
  ],

  methods: [
    function expandSVG(values) {
      var val = this.template;
      for ( k in values ) if ( values.hasOwnProperty(k) ) {
        let K = k.toUpperCase();
        val = val.replace(
          new RegExp('/\\*%' + K + '%\\*/[^\\"]*', 'g'),
          values[k]
        );
      }
      return val;
    },
    function getDataUrl(values)  {
      var svgText = this.expandSVG(values);
      return 'data:image/svg+xml;base64,' +
        btoa(svgText.replace(/\n/g, '').trim());
    }
  ]
});
