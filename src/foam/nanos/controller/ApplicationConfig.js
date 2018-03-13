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
      adapt: function(_, v) {
        return foam.String.isInstance(v) ? v !== 'false' : v;
      }
    },
    'primaryColor',
    'secondaryColor',
    'accentColor',
    'tableColor',
    'tableHoverColor',
    'privacyUrl',
    'termsUrl',
    'copyright',
  ],
});
