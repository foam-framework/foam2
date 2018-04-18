/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.http',
  name: 'DefaultHttpParameters',
  implements: [ 'foam.nanos.http.HttpParameters' ],

  documentation: '',

  properties: [
    {
      class: 'String',
      name: 'id',
      displayWidth: 40
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'owner',
      hidden: true
      // TODO: set tableCellRenderer
    },
    {
      name: 'cmd',
      class: 'Enum',
      of: 'foam.nanos.http.Command',
      value: foam.nanos.http.Command.SELECT
    },
    {
      class: 'String',
      name: 'data',
      view: { class: 'foam.u2.tag.TextArea', rows: 16, cols: 120 }
    },
    {
      name: 'format',
      class: 'Enum',
      of: 'foam.nanos.http.Format',
      value: foam.nanos.http.Format.JSON
    },
    {
      name: 'values_',
      class: 'Map',
      javaType: 'java.util.Map',
      hidden: true,
      transient: true,
      factory: function() {
        return {};
      },
      javaType: 'java.util.Map',
      javaFactory: `return new java.util.HashMap();`
    },
    {
      name: 'props_',
      class: 'Map',
      javaType: 'java.util.Map',
      hidden: true,
      transient: true,
      factory: function() {
        var map = {};
        var ps = this.cls_.getAxiomsByClass(foam.core.Property);
        for ( var i = 0; i < ps.length; i++ ) {
          map[ps[i].name] = ps;
        }
        return map;
      },
      javaType: 'java.util.Map',
      javaFactory: `
  java.util.List<foam.core.PropertyInfo> properties = (java.util.List<foam.core.PropertyInfo>) this.getClassInfo().getAxiomsByClass(foam.core.PropertyInfo.class);
  java.util.Map<String, foam.core.PropertyInfo> map = new java.util.HashMap<String, foam.core.PropertyInfo>();
  for ( foam.core.PropertyInfo prop : properties ) {
    if ( ! "props_".equals(prop.getName()) ) {
      map.put(prop.getName(), prop);
    }
  }
  return map;
`
    }
  ],

  methods: [
    {
      name: 'get',
      args: [
        {
          name: 'name',
          javaType: 'Object'
        }
      ],
      code: function(name) {
        var prop = this.props_[name];
        if ( prop != null ) {
          return prop.f(this);
        }
        return this.values_[name];
      },
      javaReturns: 'Object',
      javaCode: `
  Object obj = this.getProps_().get(name);
  Object value = null;
  if ( obj != null ) {
    if ( obj instanceof foam.core.PropertyInfo ) {
      foam.core.PropertyInfo prop = (foam.core.PropertyInfo) obj;
      value = prop.get(this);
    } else {
      value = obj;
    }
  } else {
    value = this.getValues_().get(name);
  }
  if ( value != null ) {
    return value;
  }
  javax.servlet.http.HttpServletRequest req = this.getX().get(javax.servlet.http.HttpServletRequest.class);
  return req.getParameter(name.toString());
  `
    },
    {
      name: 'getParameter',
      args: [
        {
          name: 'name',
          javaType: 'String'
        }
      ],
      code: function(name) {
        return this.get(name);
      },
      javaReturns: 'String',
      javaCode: `
  Object obj = this.get(name);
  if ( obj != null ) {
    return obj.toString();
  }
  return null;
  `
    },
    {
      name: 'getParameterValues',
      args: [
        {
          name: 'name',
          javaType: 'String'
        }
      ],
      code: function(name) {
        var prop = this.props_[name];
        if (prop != null) {
          return prop.f(this);
        }
        return null;
      },
      javaReturns: 'String[]',
      javaCode: `
  Object obj = this.get(name);
  if ( obj != null ) {
    if ( obj instanceof String[] ) {
      return (String[])obj;
    }
    return new String[] { obj.toString() };
  }
  return null;
  `
    },
    {
      name: 'set',
      args: [
        {
          name: 'name',
          javaType: 'Object'
        },
        {
          name: 'value',
          javaType: 'Object'
        }
      ],
      code: function(name, value) {
        var prop = this.props_[name];
        if ( prop != null ) {
          prop.set(this, value);
        } else {
          this.values_[name] = value;
        }
      },
      javaCode: `
  foam.core.PropertyInfo prop = (foam.core.PropertyInfo) this.getProps_().get(name);
  if ( prop != null ) {
    prop.set(this, value);
  } else {
    this.getValues_().put(name, value);
  }
`
    },
  ]
});
