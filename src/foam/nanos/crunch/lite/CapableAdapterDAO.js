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
          obj,
          (payloads, i) => { payloads[i] = obj; return obj; },
          (payloads) => { payloads.push(obj); }
        );
      }
    },
    {
      name: 'remove_',
      javaCode: `
        CapablePayload payload = (CapablePayload) obj;

        CapablePayload[] payloads = getCapable().getCapablePayloads();
        
        List<CapablePayload> newPayloadsList = new ArrayList<>();

        for ( int i = 0; i < payloads.length; i++ ){
          if ( ! payload.getCapability().equals(payloads[i].getCapability()) ){
            newPayloadsList.add(payloads[i]);
          }
        }

        if ( payloads.length == newPayloadsList.size() ){
          return null;
        }

        CapablePayload[] newPayloads = newPayloadsList.toArray(new CapablePayload[0]);
        getCapable().setCapablePayloads(newPayloads);

        return obj;
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
          idString = ((CapablePayload) id).getCapability();
        } else {
          idString = (String) id;
        }
        CapablePayload[] payloads = getCapable().getCapablePayloads();
        for ( int i = 0 ; i < payloads.length ; i++ ) {
          if (
            payloads[i].getCapability().equals(idString)
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
          if ( payload.capability == payloads[i].capability ) {
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