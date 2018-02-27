/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import java.security.*;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/** Abstract base class for all generated FOAM Objects. **/
public abstract class AbstractFObject
  extends    ContextAwareSupport
  implements FObject, Comparable
{

  public static FObject maybeClone(FObject fo) {
    return ( fo == null ? null : fo.fclone() );
  }

  public FObject deepClone() {
    return fclone();
  }

  public FObject shallowClone() {
    try {
      FObject ret = (FObject) getClassInfo().getObjClass().newInstance();
      List<PropertyInfo> props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
      for ( PropertyInfo pi : props ) {
        pi.set(ret, pi.get(this));
      }
      return ret;
    } catch (IllegalAccessException | InstantiationException e) {
      return null;
    }
  }

  public FObject fclone() {
    try {
      FObject ret = (FObject) getClassInfo().getObjClass().newInstance();
      List<PropertyInfo> props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
      for( PropertyInfo pi : props ) {
        pi.cloneProperty(this, ret);
      }
      return ret;
    } catch (IllegalAccessException | InstantiationException e) {
      return null;
    }
  }

  public Map diff(FObject obj) {
    List props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
    Iterator i = props.iterator();

    Map result = new HashMap();
    while ( i.hasNext() ) {
      PropertyInfo prop = (PropertyInfo) i.next();
      prop.diff(this, obj, result, prop);
    }

    return result;
  }

  @Override
  public int compareTo(Object o) {
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
  }

  @Override
  public boolean equals(Object o) {
    return compareTo(o) == 0;
  }

  public FObject setProperty(String prop, Object value) {
    PropertyInfo property = ((PropertyInfo) getClassInfo().getAxiomByName(prop));
    if ( property != null ) property.set(this, value);
    return this;
  }

  public Object getProperty(String prop) {
    PropertyInfo property = ((PropertyInfo) getClassInfo().getAxiomByName(prop));
    return property == null ? null : property.get(this);
  }

  public boolean isPropertySet(String prop) {
    PropertyInfo property = (PropertyInfo) getClassInfo().getAxiomByName(prop);
    return property != null && property.isSet(this);
  }

  public boolean hasDefaultValue(String prop) {
    if ( ! this.isPropertySet(prop) ) return true;
    PropertyInfo property = (PropertyInfo) getClassInfo().getAxiomByName(prop);
    return property != null && property.isDefaultValue(this);
  }

  public byte[] hash() {
    return this.hash(null);
  }

  public byte[] hash(byte[] hash) {
    return this.hash("SHA-256", hash);
  }

  public byte[] hash(String algorithm, byte[] hash) {
    try {
      MessageDigest md = MessageDigest.getInstance(algorithm);

      // update with previous hash
      if ( hash != null && hash.length != 0 ) {
        md.update(hash, 0, hash.length);
      }

      List props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
      Iterator i = props.iterator();
      while ( i.hasNext() ) {
        PropertyInfo prop = (PropertyInfo) i.next();
        if ( ! prop.isSet(this) ) continue;
        if ( prop.isDefaultValue(this) ) continue;
        md.update(prop.getNameAsByteArray());
        prop.updateDigest(this, md);
      }

      return md.digest();
    } catch (Throwable t) {
      t.printStackTrace();
      return null;
    }
  }

  public byte[] sign(PrivateKey key) {
    return this.sign("SHA256withRSA", key);
  }

  public byte[] sign(String algorithm, PrivateKey key) {
    try {
      Signature signer = Signature.getInstance(algorithm);
      signer.initSign(key, SecureRandom.getInstance("SHA1PRNG"));

      List props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
      Iterator i = props.iterator();
      while ( i.hasNext() ) {
        PropertyInfo prop = (PropertyInfo) i.next();
        if ( ! prop.isSet(this) ) continue;
        if ( prop.isDefaultValue(this) ) continue;
        signer.update(prop.getNameAsByteArray());
        prop.updateSignature(this, signer);
      }
      return signer.sign();
    } catch (Throwable t) {
      t.printStackTrace();
      return null;
    }
  }

  public boolean verify(byte[] signature, PublicKey key) {
    return this.verify(signature, "SHA256withRSA", key);
  }

  public boolean verify(byte[] signature, String algorithm, PublicKey key) {
    try {
      Signature verifier = Signature.getInstance(algorithm);
      verifier.initVerify(key);

      List props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
      Iterator i = props.iterator();
      while ( i.hasNext() ) {
        PropertyInfo prop = (PropertyInfo) i.next();
        if ( ! prop.isSet(this) ) continue;
        if ( prop.isDefaultValue(this) ) continue;
        verifier.update(prop.getNameAsByteArray());
        prop.updateSignature(this, verifier);
      }
      return verifier.verify(signature);
    } catch (Throwable t) {
      t.printStackTrace();
      return false;
    }
  }
}
