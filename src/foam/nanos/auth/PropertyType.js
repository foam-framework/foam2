foam.ENUM({
  package: 'foam.nanos.auth',
  name: 'PropertyType',
  documentation: `Indicates property type of address`,

  values: [
    {
      name: 'RESIDENTIAL',
      label: { en: 'Residential',  pt: 'Residencial'}
    },
    {
      name: 'COMMERCIAL',
      label: { en: 'Commercial',   pt: 'Comercial'}
    },
    {
      name: 'INDUSTRIAL',
      label: { en: 'Industrial',   pt: 'Industrial'}
    },
    {
      name: 'AGRICULTURAL',
      label: { en: 'Agricultural', pt: 'Agrícola'}
    },
    {
      name: 'MIXED_USE',
      label: { en: 'Mixed Use',    pt: 'Uso Misto'}
    },
    {
      name: 'SPECIAL_USE',
      label: { en: 'Special Use',  pt: 'Uso Especial'}
    }
  ]
});
