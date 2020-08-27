foam.ENUM({
  package: 'foam.nanos.auth',
  name: 'PropertyType',
  documentation: `Indicates property type of address`,

  values: [
    { name: 'RESIDENTIAL',  label: 'Residential' },
    { name: 'COMMERCIAL',   label: 'Commercial' },
    { name: 'INDUSTRIAL',   label: 'Industrial' },
    { name: 'AGRICULTURAL', label: 'Agricultural' },
    { name: 'MIXED_USE',    label: 'Mixed Use' },
    { name: 'SPECIAL_USE',  label: 'Special Use' },
  ]
});
