/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.lite',
  name: 'CapableAdapterDAO',
  extends: 'foam.dao.AbstractDAO',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'java.util.Arrays',
    'java.util.ArrayList',
    'java.util.List',
    'foam.dao.ArraySink',
    'foam.nanos.crunch.CapabilityJunctionPayload'
  ],

  documentation: `
    Adapts a Capable object to the DAO interface.
  `,

  properties: [
    {
      name: 'capable',
      class: 'FObjectProperty',
      of: 'foam.nanos.crunch.lite.Capable'
    },
    // {
    //   name: 'of',
    //   value: 'foam.nanos.crunch.lite.CapablePayloads'
    // }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        CapabilityJunctionPayload payload = (CapabilityJunctionPayload) obj;

        CapabilityJunctionPayload[] payloads = getCapable().getCapablePayloads();
        for ( int i = 0 ; i < payloads.length ; i++ ) {
          if (
            payload.getCapability().equals(
              payloads[i].getCapability()
            )
          ) {
            payloads[i] = payload;
            return obj;
          }
        }

        payloads = Arrays.copyOf(payloads, payloads.length + 1);
        payloads[payloads.length - 1] = payload;
        getCapable().setCapablePayloads(payloads);
        return obj;
      `,
      code: async function (x, obj) {
        return this.ifFoundElseIfNotFound_(
          obj.capability,
          (payloads, i) => { payloads[i] = obj; return obj; },
          (payloads) => { payloads.push(obj); return obj; }
        );
      }
    },
    {
      name: 'remove_',
      javaCode: `
        CapabilityJunctionPayload payload = (CapabilityJunctionPayload) obj;

        CapabilityJunctionPayload[] payloads = getCapable().getCapablePayloads();

        List<CapabilityJunctionPayload> newPayloadsList = new ArrayList<>();

        for ( int i = 0; i < payloads.length; i++ ){
          if ( ! payload.getCapability().equals(payloads[i].getCapability()) ){
            newPayloadsList.add(payloads[i]);
          }
        }

        if ( payloads.length == newPayloadsList.size() ){
          return null;
        }

        CapabilityJunctionPayload[] newPayloads =
          newPayloadsList.toArray(new CapabilityJunctionPayload[0]);
        getCapable().setCapablePayloads(newPayloads);

        return obj;
      `,
      code: async function (x, obj) {
        return this.ifFoundElseIfNotFound_(
          obj.capability,
          (payloads, i) => { payloads.splice(i, 1); return obj },
          (payloads) => obj
        );
      }
    },
    {
      name: 'find_',
      javaCode: `
        String idString = null;
        if ( id instanceof CapabilityJunctionPayload ) {
          idString = ((CapabilityJunctionPayload) id).getCapability();
        } else {
          idString = (String) id;
        }
        CapabilityJunctionPayload[] payloads = getCapable().getCapablePayloads();
        for ( int i = 0 ; i < payloads.length ; i++ ) {
          if (
            payloads[i].getCapability().equals(idString)
          ) {
            return payloads[i];
          }
        }
        return null;
      `,
      code: async function (x, obj) {
        let capability = typeof obj == 'string'
          ? obj : obj.capability ;
        return this.ifFoundElseIfNotFound_(
          capability,
          (payloads, i) => { return payloads[i] },
          (payloads) => null
        );
      }
    },
    {
      name: 'select_',
      javaCode: `
        ArraySink capablePayloadsToArraySink = new ArraySink.Builder(x)
          .setArray(Arrays.asList(getCapable().getCapablePayloads()))
          .build();

        return capablePayloadsToArraySink;
      `
    },
    {
      name: 'ifFoundElseIfNotFound_',
      flags: ['web'],
      code: function (capability, ifFound, ifNotFound) {
        var found = false;
        var foundReturn = null;
        payloads = this.capable.capablePayloads;
        for ( var i = 0 ; i < payloads.length ; i++ ) {
          if ( capability == payloads[i].capability ) {
            foundReturn = ifFound(payloads, i);
            found = true;
          }
        }

        if ( found ) return foundReturn;
        // payloads.push(obj);
        return ifNotFound(payloads);
      }
    }
  ]
});
