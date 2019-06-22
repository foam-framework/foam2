foam.CLASS({
  package: 'foam.demos.virtualprop',
  name: 'Person',
  ids: ['name'],
  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'country',
      permissionRequired: true
    },
    {
      class: 'String',
      name: 'country_Name',
      label: 'Country Name',
      visibility: 'RO',
      expression: function(country) {
        this.country$find.then(c => {
          if ( ! c ) return;
          if ( this.country == country )
            this.country_Name = c.name;
        })
        return '';
      },
      javaGetter: `
        return findCountry(getX()).getName();
      `,
    }
  ],
  reactions: [
    ['', 'propertyChange.country', 'update_country_Name']
  ],
  listeners: [
    {
      name: 'update_country_Name',
      code: function() {
        this.country_Name = undefined;
      }
    }
  ]
});
