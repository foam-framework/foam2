foam.INTERFACE({
  package: 'foam.nanos.controller',
  name: 'ApplicationConfig',
  properties: [
    'id',
    { class: 'URL', name: 'logo' },
    'webApp',
    {
      class: 'Boolean',
      name: 'signUpEnabled',
      adapt: function(v) {
        return v === 'false' ? false : true;
      }
    },
    'primaryColor',
    'secondaryColor',
    'tableColor',
    'tableHoverColor',
    'accentColor'
  ],
});
