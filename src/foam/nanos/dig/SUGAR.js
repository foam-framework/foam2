/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'SUGAR',

  documentation: 'Service Unified GAteway Relay - Perform non-DAO operations against a web service',

  tableColumns: [
    'id',
    'serviceKey',
    'method'
  ],

  requires: [
    'foam.nanos.dig.Argument'
  ],

  css: `
    .property-argumentInfo button {
      display: none;
    }
  `,

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
      view: function(_, X) {
        var E = foam.mlang.Expressions.create();
        return foam.u2.view.ChoiceView.create({
          dao: X.nSpecDAO
            .where(E.AND(E.EQ(E.ENDS_WITH(foam.nanos.boot.NSpec.ID, 'DAO'), false), E.EQ(foam.nanos.boot.NSpec.SERVE, true)))
            .orderBy(foam.nanos.boot.NSpec.ID),
          objToChoice: function(nspec) {
            return [nspec.id, nspec.id];
          }
        });
      },
      postSet: function() {
        var service = this.__context__[this.serviceKey];

        if ( ! service ) return;

        if ( ! service.cls_.getAxiomByName('delegate') ) return;

        var of = this.lookup(service.cls_.getAxiomByName('delegate').of);

        if ( ! of ) return;

        this.interfaceName = of.id.toString();

        var methods = of.getOwnAxiomsByClass(foam.core.Method);
        //var methodName = methods.map(function(m) { return m.name; }).sort();

        var filteredMethod =
          methods.filter(function(fm) {
            for ( var j = 0; j < fm.args.length; j++ ) {
               if ( fm.args[j].javaType.toString() == "foam.core.X" ) {
                  return false;
               }
               return true;
             }
          }).map(function(m) { return m.name; }).sort();

        if ( filteredMethod.length > 0) {
          for ( var i = 0; i < methods.length; i++ ) {
            if ( methods[i].name == filteredMethod[0] ) {
              this.argumentInfo = methods[i].args;
            }
          }
        } else {
          this.argumentInfo = null;
        }
      }
    },
    {
      class: 'String',
      name: 'method',
      label: 'Method',
      view: function(_, X) {
        return X.data.slot(function(serviceKey) {
          var service = this.__context__[serviceKey];

          if ( ! service ) return;

          if ( ! service.cls_.getAxiomByName('delegate') ) return;

          var of = this.lookup(service.cls_.getAxiomByName('delegate').of);

          if ( ! of ) return;

          var methods = of.getOwnAxiomsByClass(foam.core.Method);
          //var methodNames = methods.map(function(m) { return m.name; }).sort();

          var filteredMethod =
            methods.filter(function(fm) {
              for ( var j = 0; j < fm.args.length; j++ ) {
                 if ( fm.args[j].javaType.toString() == "foam.core.X" ) {
                    return false;
                 }
                 return true;
               }
            }).map(function(m) { return m.name; }).sort();

          return foam.u2.view.ChoiceView.create({choices: filteredMethod, data$: this.method$});
        });
      },
      postSet: function(old, nu) {
        if ( old != nu ) {
          var data = "";
          var service = this.__context__[this.serviceKey];

          if ( ! service ) return;

          if ( ! service.cls_.getAxiomByName('delegate') ) return;

          var of = this.lookup(service.cls_.getAxiomByName('delegate').of);

          if ( ! of ) return;

          var methods = of.getOwnAxiomsByClass(foam.core.Method);

          for ( var i = 0; i < methods.length; i++ ) {
            if ( methods[i].name == this.method ) {

              if ( methods[i].args.length > 0 )
                this.argumentInfo = methods[i].args;
              else this.argumentInfo = "";
            }
          }
        }
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.dig.Argument',
      name: 'argumentInfo',
      documentation: 'Set the arguments Info of the method',
      postSet: function() {
      var self = this;

      for ( let j = 0 ; j < this.argumentInfo.length ; j++ ) {
        this.argumentInfo[j].sub(function(argInfo) {
          self.flag = !self.flag;
        });
      }
      }
    },
    {
      class: 'Boolean',
      name: 'isMethodChanged',
      hidden: true
    },
    {
      class: 'String',
      name: 'interfaceName',
      displayWidth: 60,
      visibility: foam.u2.Visibility.RO,
    },
    {
      class: 'Boolean',
      name: 'flag',
      hidden: true
    },
    {
      class: 'URL',
      // TODO: appears not to work if named 'url', find out why.
      name: 'sugarURL',
      label: 'URL',
      displayWidth: 120,
      view: 'foam.nanos.dig.LinkView',
      setter: function() {}, // Prevent from ever getting set
      expression: function(serviceKey, method, interfaceName, argumentInfo, flag) {
        var query = false;
        var url = "/service/sugar";

        if ( serviceKey ) {
          url += query ? "&" : "?";
          query = true;
          url += "service=" + serviceKey;
        }
        if ( interfaceName ) {
          url += query ? "&" : "?";
          query = true;
          url += "interfaceName=" + interfaceName;
        }
        if ( method ) {
          url += query ? "&" : "?";
          query = true;
          url += "method=" + method;
        }

        for ( let j = 0 ; j < argumentInfo.length ; j++ ) {
        var newUrl = "";
        var index;

          argumentInfo[j].sub(function(ai) {
            index = j;

            if ( ai ) {
              newUrl += query ? "&" : "?";
              query = true;
              newUrl = ai.src.instance_.name + "=" + ai.src.instance_.value;

              console.log("newUrl : " + newUrl);
            }
          });
        }

        if ( flag ) {  // use this flag to give a change event on purpose for argumentInfo (FObjectArray)
          for ( let k = 0 ; k < argumentInfo.length ; k++ ) {
            query = true;

            if ( k == Number(index) ) url += newUrl;

            if ( argumentInfo[k].value != "") {
              url += query ? "&" : "?";
              url += argumentInfo[k].name + "=" + argumentInfo[k].value;
            }
          }
        } else { // use this flag to give a change event for argumentInfo (FObjectArray)
          for ( let k = 0 ; k < argumentInfo.length ; k++ ) {
            query = true;

            if ( k == Number(index) ) url += newUrl;

            if ( argumentInfo[k].value != "") {
              url += query ? "&" : "?";
              url += argumentInfo[k].name + "=" + argumentInfo[k].value;
            }
          }
        }

        return encodeURI(url);
      }
    }
  ]
});
