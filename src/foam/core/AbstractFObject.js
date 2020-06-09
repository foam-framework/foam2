/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core',
  name: 'AbstractFObject',
  abstract: true,
  flags: ['java'],

  javaImports: [
    'foam.lib.json.Outputter',
    'foam.util.SecurityUtil',
    'java.security.*',
    'java.util.HashMap',
    'java.util.Iterator',
    'java.util.List',
    'java.util.Map'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
  protected X x_ = EmptyX.instance();
  protected boolean __frozen__ = false;

  public X getX() {
    return this.x_;
  }

  public void setX(X x) {
    this.x_ = x;
  }
        `);
      }
    }
  ],

  methods: [
    {
      name: 'hashCode',
      type: 'Integer',
      javaCode: `
        int hashCode = 1;
        List props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
        Iterator i = props.iterator();

        while ( i.hasNext() ) {
          PropertyInfo pi = (PropertyInfo) i.next();
          hashCode = 31 * hashCode + java.util.Objects.hash(pi.get(this));
        }

        return hashCode;
      `
    },
    {
      name: 'equals',
      type: 'Boolean',
      args: [ { name: 'o', type: 'Any' } ],
      javaCode: `
        return compareTo(o) == 0;
      `
    },
    {
      name: 'toString',
      type: 'String',
      javaCode: `
        StringBuilder sb = new StringBuilder();
        append(sb);
        return sb.toString();
      `
    },
    {
      name: 'freeze',
      type: 'FObject',
      javaCode: `
        beforeFreeze();
        this.__frozen__ = true;
        return this;
      `
    },
    {
      name: 'isFrozen',
      type: 'Boolean',
      javaCode: `
        return this.__frozen__;
      `
    }
  ]
});
