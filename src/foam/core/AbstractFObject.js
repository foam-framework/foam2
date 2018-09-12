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
        `);
      }
    }
  ],

  methods: [
    {
      name: 'compareTo',
      javaReturns: 'int',
      args: [
        { class: 'Object', name: 'o' }
      ],
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
      name: 'equals',
      javaReturns: 'boolean',
      args: [
        { class: 'Object', name: 'o' }
      ],
      javaCode: `
        return compareTo(o) == 0;
      `
    },
    {
      name: 'diff',
      javaReturns: 'java.util.Map',
      args: [
        { class: 'FObjectProperty', name: 'obj' }
      ],
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
      javaReturns: 'foam.core.FObject',
      args: [
        { class: 'FObjectProperty', name: 'obj' }
      ],
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
        } finally {
          if ( isDiff ) return ret;
          return null;
        }
      `
    },
    {
      name: 'fclone',
      javaReturns: 'foam.core.FObject',
      javaCode: `
        try {
          FObject ret = getClass().newInstance();
          List<PropertyInfo> props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
          for( PropertyInfo prop : props ) {
            if ( ! prop.isSet(this) ) continue;
            prop.cloneProperty(this, ret);
          }
          return ret;
        } catch (IllegalAccessException | InstantiationException e) {
          return null;
        }
      `
    },
    {
      name: 'deepClone',
      javaReturns: 'foam.core.FObject',
      javaCode: `
        return fclone();
      `
    },
    {
      name: 'shallowClone',
      javaReturns: 'foam.core.FObject',
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
      javaReturns: 'foam.core.FObject',
      args: [
        { class: 'FObjectProperty', name: 'obj' }
      ],
      javaCode: `
        List<PropertyInfo> props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
        for ( PropertyInfo p : props ) {
          try {
            p.set(this, p.get(obj));
          } catch (java.lang.ClassCastException e) {
            // nop - ignore - only copy common properties.
          }
        }
        return this;
      `
    },
    {
      name: 'getProperty',
      javaReturns: 'Object',
      args: [
        { class: 'String', name: 'prop' }
      ],
      javaCode: `
        PropertyInfo property = ((PropertyInfo) getClassInfo().getAxiomByName(prop));
        return property == null ? null : property.get(this);
      `
    },
    {
      name: 'setProperty',
      javaReturns: 'foam.core.FObject',
      args: [
        { class: 'String', name: 'prop' },
        { class: 'Object', name: 'value' }
      ],
      javaCode: `
        PropertyInfo property = ((PropertyInfo) getClassInfo().getAxiomByName(prop));
        if ( property != null ) property.set(this, value);
        return this;
      `
    },
    {
      name: 'isPropertySet',
      javaReturns: 'boolean',
      args: [
        { class: 'String', name: 'prop' },
      ],
      javaCode: `
        PropertyInfo property = (PropertyInfo) getClassInfo().getAxiomByName(prop);
        return property != null && property.isSet(this);
      `
    },
    {
      name: 'hasDefaultValue',
      javaReturns: 'boolean',
      args: [
        { class: 'String', name: 'prop' }
      ],
      javaCode: `
        if ( ! this.isPropertySet(prop) ) return true;
        PropertyInfo property = (PropertyInfo) getClassInfo().getAxiomByName(prop);
        return property != null && property.isDefaultValue(this);
      `
    },
    {
      name: 'toJSON',
      javaReturns: 'String',
      javaCode: `
        Outputter out = new Outputter();
        return out.stringify(this);
      `
    },
    {
      name: 'toString',
      javaReturns: 'String',
      javaCode: `
        StringBuilder sb = new StringBuilder();
        append(sb);
        return sb.toString();
      `
    },
    {
      name: 'append',
      args: [
        { class: 'Object', name: 'sb', javaType: 'java.lang.StringBuilder' }
      ],
      javaCode: `
        List     props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
        Iterator i     = props.iterator();

        while ( i.hasNext() ) {
          PropertyInfo prop = (PropertyInfo) i.next();

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
      `
    },
    {
      name: 'beforeFreeze',
      javaCode: `
      `
    },
    {
      name: 'freeze',
      javaCode: `
        beforeFreeze();
        this.__frozen__ = true;
      `
    },
    {
      name: 'isFrozen',
      javaReturns: 'boolean',
      javaCode: `
        return this.__frozen__;
      `
    },
    {
      name: 'hash',
      javaReturns: 'byte[]',
      args: [
        { class: 'Object', name: 'md', javaType: 'java.security.MessageDigest' },
      ],
      javaCode: `
        List props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
        Iterator i = props.iterator();

        while ( i.hasNext() ) {
          PropertyInfo prop = (PropertyInfo) i.next();
          if ( ! prop.includeInDigest() ) continue;
          if ( ! prop.isSet(this) ) continue;
          if ( prop.isDefaultValue(this) ) continue;
          md.update(prop.getNameAsByteArray());
          prop.updateDigest(this, md);
        }

        return md.digest();
      `
    },
    {
      name: 'sign',
      javaReturns: 'byte[]',
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
          if ( ! prop.includeInSignature() ) continue;
          if ( ! prop.isSet(this) ) continue;
          if ( prop.isDefaultValue(this) ) continue;
          signer.update(prop.getNameAsByteArray());
          prop.updateSignature(this, signer);
        }
        return signer.sign();
      `
    },
    {
      name: 'verify',
      javaReturns: 'boolean',
      javaThrows: [
        'SignatureException'
      ],
      args: [
        { class: 'Object', name: 'signature', javaType: 'byte[]' },
        { class: 'Object', name: 'verifier', javaType: 'java.security.Signature' },
      ],
      javaCode: `
        List props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
        Iterator i = props.iterator();
        while ( i.hasNext() ) {
          PropertyInfo prop = (PropertyInfo) i.next();
          if ( ! prop.includeInSignature() ) continue;
          if ( ! prop.isSet(this) ) continue;
          if ( prop.isDefaultValue(this) ) continue;
          verifier.update(prop.getNameAsByteArray());
          prop.updateSignature(this, verifier);
        }
        return verifier.verify(signature);
      `
    }
  ]
});
