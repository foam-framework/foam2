foam.CLASS({
  package: 'foam.nanos.crunch.types',
  name: 'CapabilityViewMeta',

  /*
    Interesting note: since this class is only used by the
      interface below, this would never fail in the
      classloader even if one-model-per-file was implemented.
  */

  properties: [
    {
      name: 'label',
      class: 'String',
      documentation: `
        A label for this capability when it is displayed to a user.
      `
    },
    {
      name: 'isFeatured',
      class: 'Boolean'
    },
    {
      name: 'isNew',
      class: 'Date',
      documentation: `
        Date before which this capability should be displayed as
        "new", or null for no indicator.
      `
    }
  ]
});

foam.INTERFACE({
  package: 'foam.nanos.crunch.types',
  name: 'ViewCapability',

  properties: [
    {
      name: 'viewMeta',
      class: 'FObjectProperty',
      of: 'CapabilityViewMeta',
      documentation: `
        To prevent cluttering the axiom namespace of a Capability
        subclass, all ViewCapability properties go in a single
        property of type CapabilityViewMeta.
      `
    }
  ]
});