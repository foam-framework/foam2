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

  methods: [
    function log() {
      if (arguments.length > 1) {
        var ret = ''
        for (var i = 0 ; i < arguments.length ; i++ ) {
          ret = ret + this.normalizeDetail(arguments[i]);
        }
        this.addToDAO('log', 'Please see details', ret);
      } else if ( arguments.length == 1 ) {
        var des = this.normalizeDescription(arguments[0]) || 'Please see details';
        this.addToDAO('log', des, this.normalizeDetail(arguments[0]));
      }
    },
    function warning(e) {
      if (arguments.length > 1) {
        var ret = ''
        for (var i = 0 ; i < arguments.length ; i++ ) {
          ret = ret + this.normalizeDetail(arguments[i]);
        }
        this.addToDAO('warning', 'Please see details', ret);
      } else if ( arguments.length == 1 ) {
        var des = this.normalizeDescription(arguments[0]) || 'Please see details';
        this.addToDAO('warning', des, this.normalizeDetail(arguments[0]));
      }
    },
    function info(e) {
      if (arguments.length > 1) {
        var ret = ''
        for (var i = 0 ; i < arguments.length ; i++ ) {
          ret = ret + this.normalizeDetail(arguments[i]);
        }
        this.addToDAO('info', 'Please see details', ret);
      } else if ( arguments.length == 1 ) {
        var des = this.normalizeDescription(arguments[0]) || 'Please see details';
        this.addToDAO('info', des, this.normalizeDetail(arguments[0]));
      }
    },
    function error(e) {
      if (arguments.length > 1) {
        var ret = ''
        for (var i = 0 ; i < arguments.length ; i++ ) {
          ret = ret + this.normalizeDetail(arguments[i]);
        }
        this.addToDAO('error', 'Please see details', ret);
      } else if ( arguments.length == 1 ) {
        var des = this.normalizeDescription(arguments[0]) || 'Please see details';
        this.addToDAO('error', des, this.normalizeDetail(arguments[0]));
      }
    },
    function debug(e) {
      if (arguments.length > 1) {
        var ret = ''
        for (var i = 0 ; i < arguments.length ; i++ ) {
          ret = ret + this.normalizeDetail(arguments[i]);
        }
        this.addToDAO('debug', 'Please see details', ret);
      } else if ( arguments.length == 1 ) {
        var des = this.normalizeDescription(arguments[0]) || 'Please see details';
        this.addToDAO('debug', des, this.normalizeDetail(arguments[0]));
      }
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