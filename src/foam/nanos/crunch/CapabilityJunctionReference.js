foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'CapabilityJunctionReference',
  
  properties: [
    {
      name: 'daoKey',
      class: 'String',
      documentation: 'Specifies the DAO where the referenced object can be found.'
    },
    {
      name: 'objectId',
      class: 'String',
      documentation: 'Specified the ID of the object to which the UCJ is associated'
    },
    {
      name: 'capabilitySelector',
      class: 'StringArray',
      documentation: `
        Whitelist capabilities whos UCJ this reference applies to.
        This is optional.
      `
    },
    {
      name: 'referenceName',
      class: 'String',
      documentation: `
        A name to distinguish this UCJ-referenced object from other UCJ-referenced
        objects in a list passed to CrunchService methods like getGrantPath.
      `
    }
  ],
});