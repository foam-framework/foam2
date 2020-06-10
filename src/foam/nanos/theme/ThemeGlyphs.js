/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.theme',
  name: 'Glyph',
  documentation: `
    A glyph is a vector that can be passed colour parameters
  `,

  properties: [
    {
      name: 'template',
      class: 'String'
    },
    {
      name: 'previewUrl',
      class: 'Image',
      expression: function (template) {
        //
      }
    }
  ],

  methods: [
    function expandSVG(values) {
      var val = this.template;
      for ( k in values ) if ( values.hasOwnProperty(k) ) {
        let K = k.toUpperCase();
        val = val.replace(
          new RegExp('%' + K + '%(?!\\*/)', 'g'),
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

foam.CLASS({
  package: 'foam.nanos.theme',
  name: 'ThemeGlyphs',

  requires: [
    'foam.nanos.theme.Glyph'
  ],

  properties: [
    {
      name: 'checkmark',
      class: 'FObjectProperty',
      of: 'foam.nanos.theme.Glyph',
      factory: function () {
        return this.Glyph.create({
          template: `
<?xml version="1.0" encoding="UTF-8"?>
<svg width="40px" height="40px" viewBox="0 0 40 40" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="Symbols" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="icon/complete/48x48" transform="translate(-4.000000, -4.000000)">
            <g id="round-check_circle-24px">
                <polygon id="Path" points="0 0 48 0 48 48 0 48"></polygon>
                <path d="M18.58,32.58 L11.4,25.4 C10.62,24.62 10.62,23.36 11.4,22.58 C12.18,21.8 13.44,21.8 14.22,22.58 L20,28.34 L33.76,14.58 C34.54,13.8 35.8,13.8 36.58,14.58 C37.36,15.36 37.36,16.62 36.58,17.4 L21.4,32.58 C20.64,33.36 19.36,33.36 18.58,32.58 Z" id="Shape" fill="%FILL%" fill-rule="nonzero"></path>
            </g>
        </g>
    </g>
</svg>
          `
        });
      }
    },
    {
      name: 'exclamation',
      class: 'FObjectProperty',
      of: 'foam.nanos.theme.Glyph',
      factory: function () {
        return this.Glyph.create({
          template: `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path fill="%FILL%" fill-rule="nonzero" d="M 12 0 z m 0 13.2 c -0.66 0 -1.2 -0.54 -1.2 -1.2 V 7.2 c 0 -0.66 0.54 -1.2 1.2 -1.2 c 0.66 0 1.2 0.54 1.2 1.2 V 12 c 0 0.66 -0.54 1.2 -1.2 1.2 z m 1.2 4.8 h -2.4 v -2.4 h 2.4 V 18 z"/>
</svg>
          `
        });
      }
    }
  ]
});