/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'SUGAR',

  documentation: 'SUGAR : Service Unified GAteway Relay - Perform non-DAO operations against a web service',

  tableColumns: [
    'id',
    'serviceKey',
    'method'
  ],

  requires: [
    'foam.nanos.dig.Argument',
    'foam.net.web.HTTPRequest'
  ],

  css: `
    .property-argumentInfo button {
      display: none;
    }
  `,

  constants: [
    {
      name: 'MAX_URL_SIZE',
      value: 2000,
      type: 'Integer'
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      displayWidth: 40
    },
    {
      class: 'String',
      name: 'serviceKey',
      label: 'Service',
      documentation: 'non DAOs list as service',
      view: function(_, X) {
        var E = foam.mlang.Expressions.create();
        return foam.u2.view.ChoiceView.create({
          dao: X.nSpecDAO
            .where(E.AND(E.EQ(E.ENDS_WITH(foam.nanos.boot.NSpec.ID, 'DAO'), false), E.EQ(foam.nanos.boot.NSpec.SERVE, true)))
            .orderBy(foam.nanos.boot.NSpec.ID),
          objToChoice: function(nspec) {
            return [nspec.id, nspec.id];
          },
          placeholder: 'Please select a service'
        });
      },
      postSet: function() {
        var service = this.__context__[this.serviceKey];

        if ( ! service ) return;

        if ( ! service.cls_.getAxiomByName('delegate') ) {
          this.interfaceName = '';
          this.argumentInfo  = null;
          this.currentMethod = '';

          return;
        }
        var of = foam.lookup(service.cls_.getAxiomByName('delegate').of);

        if ( ! of ) return;

        this.interfaceName = of.id.toString();
        var methods     = of.getOwnAxiomsByClass(foam.core.Method);
        var methodNames = methods.map(function(m) { return m.name; }).sort();

        if ( methodNames.length > 0 ) {
            methods.find((item) => {
              if ( item.name == methodNames[0] ) {
                this.currentMethod = item.name;
                this.argumentInfo  = item.args;
              }
            });
        } else { // if the service doesn't have a filtered method, the following should be empty
          this.argumentInfo = null;
          this.currentMethod = '';
        }

        this.postData = '';
      }
    },
    {
      class: 'String',
      name: 'method',
      label: 'Method',
      documentation: 'the methods list of the picked service key',
      view: function(_, X) {
        return X.data.slot(function(serviceKey) {
          var service = this.__context__[serviceKey];

          if ( ! service ) return;

          if ( ! service.cls_.getAxiomByName('delegate') ) return;

          var of = foam.lookup(service.cls_.getAxiomByName('delegate').of);

          if ( ! of ) return;

          var methods = of.getOwnAxiomsByClass(foam.core.Method);
          var methodNames = methods.map(function(m) { return m.name; }).sort();

          return foam.u2.view.ChoiceView.create({ choices: methodNames, data$: this.method$ });
        });
      },
      postSet: function(old, nu) {
        if ( old != nu ) {
          var data = '';
          var service = this.__context__[this.serviceKey];

          if ( ! service ) return;

          if ( ! service.cls_.getAxiomByName('delegate') ) return;

          var of = foam.lookup(service.cls_.getAxiomByName('delegate').of);

          if ( ! of ) return;

          var methods = of.getOwnAxiomsByClass(foam.core.Method);

          methods.find((item) => {
            if ( item.name == this.method ) {
              this.currentMethod = item.name;

              if ( item.args.length > 0 )
                this.argumentInfo = item.args;
              else this.argumentInfo = '';
            }
          });
       }

       this.postData = '';
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.dig.Argument',
      name: 'argumentInfo',
      documentation: 'Set the arguments Info of the method',
      postSet: function() {
        var self = this;

        for ( var j = 0 ; j < this.argumentInfo.length ; j++ ) {
          this.argumentInfo[j].sub(function(argInfo) {
            self.flag = ! self.flag;
          });

          if ( this.argumentInfo[j].objectType ) {
            this.argumentInfo[j].objectType.sub(function(ot) {
               self.objFlag = ! self.objFlag;
            });
          }
        }
      }
    },
    {
      class: 'String',
      name: 'interfaceName',
      documentation: 'service class name',
      displayWidth: 60,
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Boolean',
      name: 'flag',
      documentation: 'to give a change event for argumentInfo',
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'objFlag',
      documentation: 'to give a change event for Object argumentInfo',
      hidden: true
    },
    {
      class: 'String',
      name: 'currentMethod',
      documentation: 'to set a current method for URL',
      hidden: true
    },
    {
      class: 'String',
      name: 'postData',
      value: '',
      hidden: true
    },
    {
      class: 'String',
      name: 'postURL',
      value: '',
      hidden: true
    },
    {
      class: 'URL',
      // TODO: appears not to work if named 'url', find out why.
      name: 'sugarURL',
      label: 'URL',
      hidden: false,
      displayWidth: 120,
      documentation: 'dynamic URL according to picking service, method, parameters against web agent',
      view: 'foam.nanos.dig.LinkView',
      setter: function() {}, // Prevent from ever getting set
      expression: function(serviceKey, method, interfaceName, argumentInfo, flag, currentMethod, objFlag) {
        var query = false;
        var url   = '/service/sugar';

        this.postData = null;

       if ( serviceKey ) {
          url += query ? '&' : '?';
          query = true;
          url += 'service=' + serviceKey;
        }
        if ( interfaceName ) {
          url += query ? '&' : '?';
          query = true;
          url += 'interfaceName=' + interfaceName;
        }
        if ( currentMethod ) {
          url += query ? '&' : '?';
          query = true;
          url += 'method=' + currentMethod;
        }

        for ( var k = 0; k < argumentInfo.length; k++ ) {
          query = true;

          if ( argumentInfo[k].value != '' ) {
            this.postData += query ? '&' : '?';
            this.postData += argumentInfo[k].name + '=' + argumentInfo[k].value;
          }

          if ( argumentInfo[k].objectType ) {
            var javaType_ = argumentInfo[k].javaType;
            var prop = foam.lookup(javaType_).getAxiomsByClass(foam.core.Property);
            this.postData += '&' + argumentInfo[k].name + '=' + argumentInfo[k].name + '&';

            for ( var i = 0 ; i < prop.length ; i++ ) {
              if ( argumentInfo[k].objectType.instance_[prop[i].name] ) {
                this.postData += query ? '&' : '?';
                query = true;

                this.postData += prop[i].name + '=' + argumentInfo[k].objectType.instance_[prop[i].name];
              }
            }
          }
        }
        if ( (url.length + this.postData.length) >= this.MAX_URL_SIZE ) {
          this.postURL = url;
        }

        return encodeURI(url + this.postData);
      }
    },
    {
      class: 'String',
      name: 'result',
      value: 'No Request Sent Yet.',
      view: { class: 'foam.u2.tag.TextArea', rows: 5, cols: 137 },
      visibility: 'RO'
    }
  ],

  actions: [
    {
      name: 'postButton',
      label: 'Send POST Request',
      code: async function() {
        if ( this.postURL !== '' ) {
          var req = this.HTTPRequest.create({
            url: window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + this.postURL + this.postData+ "&sessionId=" + localStorage.defaultSession,
            method: 'POST',
            contentType: 'url',
            payload: this.postData.substring(1),
          }).send();

          var resp = await req.then(async function(resp) {
            var temp = await resp.payload.then(function(result) {
              return result;
            });
            return temp;
          }, async function(error) {
            var temp = await error.payload.then(function(result) {
              return result;
            });
            return temp;
          });

          this.result = resp;
        } else {
          alert('Click on URL link.');
        }
      }
    }
  ]
});
