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
    'foam.dao.ArraySink'
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
        CapablePayload payload = (CapablePayload) obj;

        CapablePayload[] payloads = getCapable().getCapablePayloads();
        for ( int i = 0 ; i < payloads.length ; i++ ) {
          if (
            payload.getCapability().getId().equals(
              payloads[i].getCapability().getId()
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
          obj,
          (payloads, i) => { payloads[i] = obj; return obj; },
          (payloads) => { payloads.push(obj); }
        );
      }
    },
    {
      name: 'remove_',
      javaCode: `
        return obj; // TODO
      `,
      code: async function (x, obj) {
        return this.ifFoundElseIfNotFound_(
          obj,
          (payloads, i) => { payloads.splice(i, 1); return obj },
          (payloads) => obj
        );
      }
    },
    {
      name: 'find_',
      javaCode: `
        String idString = null;
        if ( id instanceof CapablePayload ) {
          idString = ((CapablePayload) id).getCapability().getId();
        } else {
          idString = (String) id;
        }
        CapablePayload[] payloads = getCapable().getCapablePayloads();
        for ( int i = 0 ; i < payloads.length ; i++ ) {
          if (
            payloads[i].getCapability().getId().equals(idString)
          ) {
            return payloads[i];
          }
        }
        return null;
      `
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
      code: function (payload, ifFound, ifNotFound) {
        var found = false;
        var foundReturn = null;
        payloads = this.capable.capablePayloads;
        for ( var i = 0 ; i < payloads.length ; i++ ) {
          if ( payload.capability.id == payloads[i].capability.id ) {
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