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
