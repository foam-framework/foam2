foam.CLASS({
  package: 'foam.u2',
  name: 'ClientResourceCache',

  axioms: [ foam.pattern.Singleton.create() ],

  properties: [
    {
      name: 'files',
      class: 'Map'
    }
  ],
  
  methods: [
    {
      name: 'saveImageFromURL',
      documentation: `
        This method saves an image to a client-side cache as a base64 url.
        If the url was found in the cache, the corresponding base64 url is
        returned, otherwise the original url is returned so the image can
        be loaded as normal.
      `,
      code: function(url) {
        var self = this;

        if ( this.files[url] ) {
          console.log('Found "'+url+'" in ClientResourceCache.');
          return this.files[url];
        }

        var image = new Image();
        image.crossOrigin = 'Anonymous';
        image.addEventListener('load', (e) => {
          var canvas = document.createElement('canvas');
          var cctx = canvas.getContext('2d');

          canvas.width = image.width;
          canvas.height = image.height;
          cctx.drawImage(image, 0, 0);

          self.files[url] = canvas.toDataURL();
          console.log('Added "'+url+'" to ClientResourceCache.');
        });
        image.src = url;

        return url;
      }
    }
  ]
});
