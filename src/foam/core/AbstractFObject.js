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
            return this.hash(null);
          }

          public byte[] hash(byte[] hash)
            throws NoSuchAlgorithmException
          {
            return this.hash("SHA-256", hash);
          }

          // convenience sign method
          public byte[] sign(PrivateKey key)
            throws NoSuchAlgorithmException, InvalidKeyException, SignatureException
          {
            return this.sign("SHA256withRSA", key);
          }

          // convenience verify method
          public boolean verify(byte[] signature, PublicKey key)
            throws NoSuchAlgorithmException, InvalidKeyException, SignatureException
          {
            return this.verify(signature, "SHA256withRSA", key);
          }
        `);
      }
    }
  ],

  methods: [
    {
      name: 'compareTo',
      returns: 'Integer',
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
      name: 'equals',
      returns: 'Boolean',
      args: [ { name: 'o', type: 'Any' } ],
      javaCode: `
        return compareTo(o) == 0;
      `
    },
    {
      name: 'diff',
      returns: 'Map',
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
      returns: 'FObject',
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
        } finally {
          if ( isDiff ) return ret;
          return null;
        }
      `
    },
    {
      name: 'fclone',
      returns: 'FObject',
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
      returns: 'FObject',
      javaCode: `
        return fclone();
      `
    },
    {
      name: 'shallowClone',
      returns: 'FObject',
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
      returns: 'FObject',
      args: [ { name: 'obj', type: 'FObject' } ],
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
      returns: 'Any',
      args: [ { name: 'prop', type: 'String' } ],
      javaCode: `
        PropertyInfo property = ((PropertyInfo) getClassInfo().getAxiomByName(prop));
        return property == null ? null : property.get(this);
      `
    },
    {
      name: 'setProperty',
      returns: 'FObject',
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
      returns: 'Boolean',
      args: [ { name: 'prop', type: 'String' } ],
      javaCode: `
        PropertyInfo property = (PropertyInfo) getClassInfo().getAxiomByName(prop);
        return property != null && property.isSet(this);
      `
    },
    {
      name: 'hasDefaultValue',
      returns: 'Boolean',
      args: [ { name: 'prop', type: 'String' } ],
      javaCode: `
        if ( ! this.isPropertySet(prop) ) return true;
        PropertyInfo property = (PropertyInfo) getClassInfo().getAxiomByName(prop);
        return property != null && property.isDefaultValue(this);
      `
    },
    {
      name: 'toJSON',
      returns: 'String',
      javaCode: `
        Outputter out = new Outputter();
        return out.stringify(this);
      `
    },
    {
      name: 'toString',
      returns: 'String',
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
      returns: 'Void',
      javaCode: `
      `
    },
    {
      name: 'freeze',
      returns: 'Void',
      javaCode: `
        beforeFreeze();
        this.__frozen__ = true;
      `
    },
    {
      name: 'isFrozen',
      returns: 'Boolean',
      javaCode: `
        return this.__frozen__;
      `
    },
    {
      name: 'hash',
      returns: 'ByteArray',
      javaThrows: [
        'java.security.NoSuchAlgorithmException'
      ],
      args: [ { name: 'algorithm', type: 'String' },
              { name: 'hash', type: 'ByteArray' } ],
      javaCode: `
        MessageDigest md = MessageDigest.getInstance(algorithm);
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

        // no chaining so return digest
        if ( hash == null || hash.length == 0 ) {
          return md.digest();
        }

        // calculate digest, update with previous hash and current hash
        byte[] digest = md.digest();
        md.update(hash);
        md.update(digest);
        return md.digest();
      `
    },
    {
      name: 'sign',
      javaReturns: 'byte[]',
      javaThrows: [
        'NoSuchAlgorithmException',
        'InvalidKeyException',
        'SignatureException'
      ],
      args: [
        { class: 'String', name: 'algorithm' },
        { class: 'Object', name: 'key', javaType: 'java.security.PrivateKey' },
      ],
      javaCode: `
        Signature signer = Signature.getInstance(algorithm);
        signer.initSign(key, SecurityUtil.GetSecureRandom());

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
        'NoSuchAlgorithmException',
        'InvalidKeyException',
        'SignatureException'
      ],
      args: [
        { class: 'Object', name: 'signature', type: 'ByteArray' },
        { class: 'String', name: 'algorithm' },
        { class: 'Object', name: 'key', javaType: 'java.security.PublicKey' },
      ],
      javaCode: `
        Signature verifier = Signature.getInstance(algorithm);
        verifier.initVerify(key);

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
