/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.INTERFACE({
  package: 'foam.nanos.medusa',
  name: 'Electable',

  documentation: '',

  /** developer notes:
//Start primary():
//if globalId <= maxIn from mn then update untill meet sam globalId
//if globalId > maxIn revert to maxIn
//waiting primary;
//after primary define globalIndex => send index to secondary. And secondary
//can start to initial.
//leavePrimary waiting untill all inflight request finish
//leaveSecondary stop listener.
//MMDAO inplement Electable.
//
//data should always come from 2/3
//If data can not from from 2/3 we should terminate dao operation.

//Instance register.
//When MN start. broadcast available servive to MM(currently)
//MM will hardbeet though servive.
//MM has a register to register node to substriber
//
//We do not consider MN fail right now.
*/

  methods: [
    {
      name: 'primary',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    },
    {
      name: 'secondary',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    },
    {
      name: 'leavePrimary',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    },
    {
      name: 'leaveSecondary',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    },
    {
      name: 'isPrimary',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    },
    {
      name: 'isSecondary',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    },
  ]
});
