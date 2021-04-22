/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.nanos.theme',
  name: 'ThemeGlyphs',

  documentation: `
    Stores svgs for standard glyphs.
    SVG properties can have variables and fallback values. Look at fill properties for formatting.
  `,

  requires: [
    'foam.core.Glyph'
  ],

  properties: [
    {
      name: 'checkmark',
      class: 'GlyphProperty',
      of: 'foam.core.Glyph',
      factory: function() {
        return { template: `
        <?xml version="1.0" encoding="UTF-8"?>
        <svg width="40px" height="40px" viewBox="0 0 40 40" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <g id="Symbols" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g id="icon/complete/48x48" transform="translate(-4.000000, -4.000000)">
                    <g id="round-check_circle-24px">
                        <polygon id="Path" points="0 0 48 0 48 48 0 48"></polygon>
                        <path d="M18.58,32.58 L11.4,25.4 C10.62,24.62 10.62,23.36 11.4,22.58 C12.18,21.8 13.44,21.8 14.22,22.58 L20,28.34 L33.76,14.58 C34.54,13.8 35.8,13.8 36.58,14.58 C37.36,15.36 37.36,16.62 36.58,17.4 L21.4,32.58 C20.64,33.36 19.36,33.36 18.58,32.58 Z" id="Shape" fill= "/*%FILL%*/ #ffffff" fill-rule="nonzero"></path>
                    </g>
                </g>
            </g>
        </svg>
        ` };
      }
    },
    {
      name: 'exclamation',
      class: 'GlyphProperty',
      of: 'foam.core.Glyph',
      factory: function() {
        return { template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="/*%FILL%*/ #ffffff" fill-rule="nonzero" d="M 12 0 z m 0 13.2 c -0.66 0 -1.2 -0.54 -1.2 -1.2 V 7.2 c 0 -0.66 0.54 -1.2 1.2 -1.2 c 0.66 0 1.2 0.54 1.2 1.2 V 12 c 0 0.66 -0.54 1.2 -1.2 1.2 z m 1.2 4.8 h -2.4 v -2.4 h 2.4 V 18 z"/>
        </svg>
        ` };
      }
    },
    {
      name: 'pending',
      class: 'GlyphProperty',
      of: 'foam.core.Glyph',
      factory: function() {
        return { template: `
        <?xml version="1.0" encoding="UTF-8"?>
        <svg width="14px" height="14px" viewBox="0 0 14 14" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <title>round-check_circle-24px (5)</title>
            <g id="Ablii" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g id="Enum" transform="translate(-1490.000000, -409.000000)">
                    <g id="Group-33" transform="translate(1490.000000, 409.000000)">
                        <path d="M8.66666667,3 C9.08974359,3 9.4418146,3.30674556 9.49347595,3.7000091 L9.5,3.8 L9.5,5.072 C9.5,5.24866667 9.43923611,5.41977778 9.3273534,5.55987037 L9.25416667,5.64 L7.83333333,7 L9.25833333,8.372 C9.38680556,8.49533333 9.46898148,8.65755556 9.49280478,8.83088889 L9.5,8.936 L9.5,10.2 C9.5,10.6061538 9.18047337,10.944142 8.77082385,10.9937369 L8.66666667,11 L5.33333333,11 C4.91025641,11 4.5581854,10.6932544 4.50652405,10.2999909 L4.5,10.2 L4.5,8.936 C4.5,8.75933333 4.56076389,8.58822222 4.67023534,8.44812963 L4.74166667,8.368 L6.16666667,7 L4.74583333,5.636 C4.61388889,5.50933333 4.53113426,5.34655556 4.50721451,5.17312963 L4.5,5.068 L4.5,3.8 C4.5,3.39384615 4.81952663,3.05585799 5.22917615,3.00626309 L5.33333333,3 L8.66666667,3 Z M7,7.2 L5.33333333,8.8 L5.33333333,9.8 C5.33333333,9.9925 5.47688802,10.154375 5.66630046,10.1918359 L5.75,10.2 L8.25,10.2 C8.45052083,10.2 8.61914062,10.0621875 8.65816243,9.88035156 L8.66666667,9.8 L8.66666667,8.8 L7,7.2 Z M7,6.8 L5.33333333,5.2 L5.33333333,4.2 C5.33333333,3.98 5.52083333,3.8 5.75,3.8 L8.25,3.8 C8.47916667,3.8 8.66666667,3.98 8.66666667,4.2 L8.66666667,5.2 L7,6.8 Z" id="Shape" fill="/*%FILL%*/ #FFFFFF"></path>
                    </g>
                </g>
            </g>
        </svg>
        ` };
      }
    },
    {
      name: 'spinner',
      class: 'FObjectProperty',
      of: 'foam.core.Glyph',
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
