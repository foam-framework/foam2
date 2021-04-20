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
    },
    {
      name: 'spinner',
      class: 'FObjectProperty',
      of: 'foam.nanos.theme.Glyph',
      factory: function () {
        return this.Glyph.create({
          template: `
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
    <path fill="%FILL%" fill-rule="nonzero" d="M14.927 10.839a6.194 6.194 0 0 1-6.723 4.318A6.188 6.188 0 0 1 2.83 9.613l1.271.972a.392.392 0 0 0 .477-.623L2.751 8.564a.392.392 0 0 0-.55.073L.803 10.464a.393.393 0 0 0 .624.477l.667-.873a6.972 6.972 0 0 0 6.01 5.868 6.975 6.975 0 0 0 7.573-4.865.392.392 0 1 0-.75-.232zm1.676-4.008l-.723.943a6.972 6.972 0 0 0-5.984-5.72A6.978 6.978 0 0 0 2.323 6.92a.392.392 0 1 0 .75.232 6.196 6.196 0 0 1 6.722-4.318 6.192 6.192 0 0 1 5.35 5.283l-1.215-.93a.392.392 0 1 0-.477.623l1.825 1.398a.393.393 0 0 0 .55-.073l1.398-1.826a.394.394 0 0 0-.073-.55.391.391 0 0 0-.55.073z"/>
</svg>
          `
        })
      }
    }
  ]
});
