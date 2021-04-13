foam.CLASS({
  package: 'foam.core',
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
      expression: function(template) {
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
