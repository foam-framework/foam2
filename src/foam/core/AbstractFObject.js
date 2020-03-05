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
          public static FObject maybeClone(FObject fo) {
            return ( fo == null ? null : fo.fclone() );
          }

          protected X x_ = EmptyX.instance();
          protected boolean __frozen__ = false;

          public X getX() {
            return this.x_;
          }

          public void setX(X x) {
            this.x_ = x;
          }

          // Template method for initializing object after done being built.
          public void init_() {
          }

          // convenience hash function
          public byte[] hash()
            throws NoSuchAlgorithmException
          {
            return this.hash("SHA-256");
          }

          public byte[] hash(String algorithm)
            throws NoSuchAlgorithmException
          {
            return this.hash(MessageDigest.getInstance(algorithm));
          }

          // convenience sign method
          public byte[] sign(PrivateKey key)
            throws NoSuchAlgorithmException, InvalidKeyException, SignatureException
          {
            return this.sign(String.format("SHA256with%s", key.getAlgorithm()), key);
          }

          public byte[] sign(String algorithm, PrivateKey key)
            throws NoSuchAlgorithmException, InvalidKeyException, SignatureException
          {
            Signature signer = Signature.getInstance(algorithm);
            signer.initSign(key, SecurityUtil.GetSecureRandom());
            return this.sign(signer);
          }

          // convenience verify method
          public boolean verify(byte[] signature, PublicKey key)
            throws NoSuchAlgorithmException, InvalidKeyException, SignatureException
          {
            return this.verify(signature, String.format("SHA256with%s", key.getAlgorithm()), key);
          }

          public boolean verify(byte[] signature, String algorithm, PublicKey key)
            throws NoSuchAlgorithmException, InvalidKeyException, SignatureException
          {
            Signature verifier = Signature.getInstance(algorithm);
            verifier.initVerify(key);
            return this.verify(signature, verifier);
          }

          public void assertNotFrozen()
            throws UnsupportedOperationException
          {
            if ( __frozen__ ) throw new UnsupportedOperationException("Object is frozen.");
          }
        `);
      }
    }
  ],

  // properties: [
  //   {
  //     name: 'userFeedback',
  //     class: 'FObjectProperty',
  //     of: 'foam.comics.v2.userfeedback.UserFeedback',
  //     storageTransient: true
  //   }
  // ],

  methods: [
    {
      name: 'compareTo',
      type: 'Integer',
      args: [ { name: 'o', type: 'Any' } ],
      javaCode: `
        if ( o == this ) return 0;
        if ( o == null ) return 1;
        if ( ! ( o instanceof FObject ) ) return 1;

        if ( getClass() != o.getClass() ) {
          return getClassInfo().getId().compareTo(((FObject)o).getClassInfo().getId());
        }

        List props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
        Iterator i = props.iterator();

        int result;
        while ( i.hasNext() ) {
          result = ((PropertyInfo) i.next()).compare(this, o);
          if ( result != 0 ) return result;
        }

        return 0;
      `
    },
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
      name: 'diff',
      type: 'Map',
      args: [ { name: 'obj', type: 'FObject' } ],
      javaCode: `
        List props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
        Iterator i = props.iterator();

        Map result = new HashMap();
        while ( i.hasNext() ) {
          PropertyInfo prop = (PropertyInfo) i.next();
          prop.diff(this, obj, result, prop);
        }

        return result;
      `
    },
    {
      name: 'hardDiff',
      type: 'FObject',
      args: [ { name: 'obj', type: 'FObject' } ],
      javaCode: `
        FObject ret = null;
        boolean isDiff = false;
        try {
          ret = (FObject) getClass().newInstance();
          List props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
          Iterator i = props.iterator();
          PropertyInfo prop = null;
          while ( i.hasNext() ) {
            prop = (PropertyInfo) i.next();
            if ( prop.hardDiff(this, obj, ret) ) {
              isDiff = true;
            }
          }
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
        if ( isDiff ) return ret;
        return null;
      `
    },
    {
      name: 'fclone',
      type: 'FObject',
      javaCode: `
        try {
          FObject ret = getClass().newInstance();
          List<PropertyInfo> props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
          for ( PropertyInfo prop : props ) {
            if ( ! prop.isSet(this) ) continue;
            prop.cloneProperty(this, ret);
          }
          return ret;
        } catch (IllegalAccessException | InstantiationException e) {
          return this;
        }
      `
    },
    {
      name: 'deepClone',
      type: 'FObject',
      javaCode: `
        return fclone();
      `
    },
    {
      name: 'validate',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
        List<PropertyInfo> props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
        for ( PropertyInfo prop : props ) {
          prop.validateObj(x, this);
        }
      `
    },
    {
      name: 'shallowClone',
      type: 'FObject',
      javaCode: `
        try {
          FObject ret = getClass().newInstance();
          List<PropertyInfo> props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
          for ( PropertyInfo prop : props ) {
            if ( ! prop.isSet(this) ) continue;
            prop.set(ret, prop.get(this));
          }
          return ret;
        } catch (IllegalAccessException | InstantiationException e) {
          return null;
        }
      `
    },
    {
      name: 'copyFrom',
      type: 'FObject',
      args: [ { name: 'obj', type: 'FObject' } ],
      javaCode: `
        List<PropertyInfo> props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
        for ( PropertyInfo p : props ) {
          try {
            if ( p.isSet(obj) ) p.set(this, p.get(obj));
          } catch (java.lang.ClassCastException e) {
            // nop - ignore - only copy common properties.
          }
        }
        return this;
      `
    },
    {
      name: 'getProperty',
      type: 'Any',
      args: [ { name: 'prop', type: 'String' } ],
      javaCode: `
        PropertyInfo property = ((PropertyInfo) getClassInfo().getAxiomByName(prop));
        return property == null ? null : property.get(this);
      `
    },
    {
      name: 'setProperty',
      type: 'FObject',
      args: [ { name: 'prop', type: 'String' },
              { name: 'value', type: 'Any' } ],
      javaCode: `
        PropertyInfo property = ((PropertyInfo) getClassInfo().getAxiomByName(prop));
        if ( property != null ) property.set(this, value);
        return this;
      `
    },
    {
      name: 'isPropertySet',
      type: 'Boolean',
      args: [ { name: 'prop', type: 'String' } ],
      javaCode: `
        PropertyInfo property = (PropertyInfo) getClassInfo().getAxiomByName(prop);
        return property != null && property.isSet(this);
      `
    },
    {
      name: 'hasDefaultValue',
      type: 'Boolean',
      args: [ { name: 'prop', type: 'String' } ],
      javaCode: `
        if ( ! this.isPropertySet(prop) ) return true;
        PropertyInfo property = (PropertyInfo) getClassInfo().getAxiomByName(prop);
        return property != null && property.isDefaultValue(this);
      `
    },
    {
      name: 'toJSON',
      type: 'String',
      javaCode: `
        Outputter out = new Outputter(getX());
        return out.stringify(this);
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
      name: 'append',
      args: [ { name: 'sb', javaType: 'java.lang.StringBuilder' } ],
      javaCode: `
        List     props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
        Iterator i     = props.iterator();

        while ( i.hasNext() ) {
          PropertyInfo prop = (PropertyInfo) i.next();

          // Don't output Personally Identifiable Information (PII)
          if ( ! prop.containsPII() ) {
            sb.append(prop.getName());
            sb.append(": ");

            try {
              Object value = prop.get(this);

              if ( value instanceof Appendable ) {
                ((Appendable) value).append(sb);
              } else {
                sb.append(value);
              }
            } catch (Throwable t) {
              sb.append("-");
            }

            if ( i.hasNext() ) sb.append(", ");
          }
        }
      `
    },
    {
      name: 'beforeFreeze',
      type: 'Void',
      javaCode: `
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
    },
    {
      name: 'hash',
      type: 'Byte[]',
      args: [
        { name: 'md', javaType: 'java.security.MessageDigest' },
      ],
      javaCode: `
        List props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
        Iterator i = props.iterator();

        while ( i.hasNext() ) {
          PropertyInfo prop = (PropertyInfo) i.next();
          if ( ! prop.includeInDigest() ) continue;
          if ( ! prop.isSet(this) ) continue;
          md.update(prop.getNameAsByteArray());
          prop.updateDigest(this, md);
        }

        return md.digest();
      `
    },
    {
      name: 'sign',
      type: 'Byte[]',
      javaThrows: [
        'SignatureException'
      ],
      args: [
        { class: 'Object', name: 'signer', javaType: 'java.security.Signature' },
      ],
      javaCode: `
        List props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
        Iterator i = props.iterator();
        while ( i.hasNext() ) {
          PropertyInfo prop = (PropertyInfo) i.next();
          if ( ! prop.includeInDigest() ) continue;
          if ( ! prop.isSet(this) ) continue;
          signer.update(prop.getNameAsByteArray());
          prop.updateSignature(this, signer);
        }
        return signer.sign();
      `
    },
    {
      name: 'verify',
      type: 'Boolean',
      javaThrows: [ 'java.security.SignatureException' ],
      args: [
        { name: 'signature', type: 'Byte[]' },
        { name: 'verifier', javaType: 'java.security.Signature' },
      ],
      javaCode: `
        List props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
        Iterator i = props.iterator();
        while ( i.hasNext() ) {
          PropertyInfo prop = (PropertyInfo) i.next();
          if ( ! prop.includeInDigest() ) continue;
          if ( ! prop.isSet(this) ) continue;
          verifier.update(prop.getNameAsByteArray());
          prop.updateSignature(this, verifier);
        }
        return verifier.verify(signature);
      `
    }
  ]
});
