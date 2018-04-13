/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'GUIDLogger',

  imports: [
    'logDAO',
    'user'
  ],

  requires: [
    'foam.nanos.logger.Log'
  ],

  properties: [
    {
      name: 'self',
      factory: function(){
        return this;
      }
    }
  ],

  methods: [
    function outputLogger(type, array) {
      if (array.length > 1) {
        var ret = ''
        for (var i = 0 ; i < array.length ; i++ ) {
          ret = ret + this.normalizeDetail(array[i]);
        }
        this.addToDAO(type, 'Please see details', ret);
      } else if ( array.length == 1 ) {
        var des = this.normalizeDescription(array[0]) || 'Please see details';
        this.addToDAO(type, des, this.normalizeDetail(array[0]));
      }
    },
    function log() {
      this.outputLogger('log', Array.from(arguments))
    },
    function warning() {
      this.outputLogger('warning', Array.from(arguments))
    },
    function info() {
      this.outputLogger('info', Array.from(arguments))
    },
    function error() {
      this.outputLogger('error', Array.from(arguments))
    },
    function debug() {
      this.outputLogger('debug', Array.from(arguments))
    },
    function normalizeDetail(e) {
      if ( foam.core.Exception.isInstance(e) ) {
        return '' + e + '\n' + '[name]: ' + e.name + '\n' + '[message]: ' + e.message + '\n';
      } else if ( e instanceof Error ) {
        return '' + e + '\n' + '[name]: ' + e.name + '\n' + '[message]: ' + e.message + '\n';
      } else {
        return '' + e + '\n';
      }
    },
    function normalizeDescription(e) {
      return (!! e.name) ? '' + e.name : undefined; 
    },
    function addToDAO(type, description, detail) {
      var l = this.generateLogModel(type, description, detail);
      this.logDAO.put(l);
    },
    function generateLogModel(type, description, detail) {
      return this.Log.create({
        time: new Date(),
        from: 'Web',
        user: (! this.user) ? '' : '' + this.user.firstName + ' ' + this.user.lastName,
        type: type,
        description: description,
        detail: detail
      })
    }
  ]
})