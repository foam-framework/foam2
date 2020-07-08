/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.crypto.hash.Hashable;
import foam.crypto.sign.Signable;
import foam.lib.json.Outputter;
import foam.util.SecurityUtil;
import java.security.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public interface FObject
  extends Appendable, ContextAware, Comparable, Freezable, Hashable, Signable, Validatable
{
  foam.core.MethodInfo APPEND =     new foam.core.MethodInfo(){
    @Override
    public String getName(){
      return "append";
    }
    @Override
    public Object call(foam.core.X x, Object receiver, Object[] args){
      ((FObject)receiver).append((java.lang.StringBuilder)(args[0]));
      return null;}
  };

  foam.core.MethodInfo COPY_FROM = new foam.core.MethodInfo(){
    @Override
    public String getName(){
      return "copyFrom";
    }
    @Override
    public Object call(foam.core.X x, Object receiver, Object[] args){
      return     ((FObject)receiver).copyFrom((foam.core.FObject)(args[0]));
    }
  };

  foam.core.MethodInfo FCLONE = new foam.core.MethodInfo(){
    @Override
    public String getName(){
      return "fclone";
    }
    @Override
    public Object call(foam.core.X x, Object receiver, Object[] args){
      return     ((FObject)receiver).fclone();
    }
  };

  foam.core.MethodInfo DEEP_CLONE = new foam.core.MethodInfo(){
    @Override
    public String getName(){
      return "deepClone";
    }
    @Override
    public Object call(foam.core.X x, Object receiver, Object[] args){
      return     ((FObject)receiver).deepClone();
    }
  };

  foam.core.MethodInfo SHALLOW_CLONE = new foam.core.MethodInfo(){
    @Override
    public String getName(){
      return "shallowClone";
    }
    @Override
    public Object call(foam.core.X x, Object receiver, Object[] args){
      return     ((FObject)receiver).shallowClone();
    }
  };

  foam.core.MethodInfo DIFF = new foam.core.MethodInfo(){
    @Override
    public String getName(){
      return "diff";
    }
    @Override
    public Object call(foam.core.X x, Object receiver, Object[] args){
      return     ((FObject)receiver).diff((foam.core.FObject)(args[0]));
    }
  };

  foam.core.MethodInfo HARD_DIFF = new foam.core.MethodInfo(){
    @Override
    public String getName(){
      return "hardDiff";
    }
    @Override
    public Object call(foam.core.X x, Object receiver, Object[] args){
      return     ((FObject)receiver).hardDiff((foam.core.FObject)(args[0]));
    }
  };

  foam.core.MethodInfo SET_PROPERTY = new foam.core.MethodInfo(){
    @Override
    public String getName(){
      return "setProperty";
    }
    @Override
    public Object call(foam.core.X x, Object receiver, Object[] args){
      return     ((FObject)receiver).setProperty((String)(args[0]), args[1]);
    }
  };

  foam.core.MethodInfo GET_PROPERTY = new foam.core.MethodInfo(){
    @Override
    public String getName(){
      return "getProperty";
    }
    @Override
    public Object call(foam.core.X x, Object receiver, Object[] args){
      return     ((FObject)receiver).getProperty((String)(args[0]));
    }
  };

  foam.core.MethodInfo IS_PROPERTY_SET = new foam.core.MethodInfo(){
    @Override
    public String getName(){
      return "isPropertySet";
    }
    @Override
    public Object call(foam.core.X x, Object receiver, Object[] args){
      return     ((FObject)receiver).isPropertySet((String)(args[0]));
    }
  };

  foam.core.MethodInfo HAS_DEFAULT_VALUE = new foam.core.MethodInfo(){
    @Override
    public String getName(){
      return "hasDefaultValue";
    }
    @Override
    public Object call(foam.core.X x, Object receiver, Object[] args){
      return     ((FObject)receiver).hasDefaultValue((String)(args[0]));
    }
  };

  foam.core.MethodInfo COMPARE_TO =     new foam.core.MethodInfo(){
    @Override
    public String getName(){
      return "compareTo";
    }
    @Override
    public Object call(foam.core.X x, Object receiver, Object[] args){
      return     ((FObject)receiver).compareTo(args[0]);
    }
  };

  foam.core.MethodInfo VALIDATE =     new foam.core.MethodInfo(){
    @Override
    public String getName(){
      return "validate";
    }
    @Override
    public Object call(foam.core.X x, Object receiver, Object[] args){
      ((FObject)receiver).validate((foam.core.X)(args[0]));
      return null;}
  };

  foam.core.MethodInfo VERIFY =     new foam.core.MethodInfo(){
    @Override
    public String getName(){
      return "verify";
    }
    @Override
    public Object call(foam.core.X x, Object receiver, Object[] args){
      try {
        return     ((FObject)receiver).verify((byte[])(args[0]), (java.security.Signature)(args[1]));
      }
      catch (Throwable t) {
        foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
        logger.error(t.getMessage());
      }

      return null;}
  };

  foam.core.MethodInfo BEFORE_FREEZE =     new foam.core.MethodInfo(){
    @Override
    public String getName(){
      return "beforeFreeze";
    }
    @Override
    public Object call(foam.core.X x, Object receiver, Object[] args){
      ((FObject)receiver).beforeFreeze();
      return null;}
  };

  foam.core.MethodInfo HASH =     new foam.core.MethodInfo(){
    @Override
    public String getName(){
      return "hash";
    }
    @Override
    public Object call(foam.core.X x, Object receiver, Object[] args){
      return     ((FObject)receiver).hash((java.security.MessageDigest)(args[0]));
    }
  };

  foam.core.MethodInfo SIGN =     new foam.core.MethodInfo(){
    @Override
    public String getName(){
      return "sign";
    }
    @Override
    public Object call(foam.core.X x, Object receiver, Object[] args){
      try {
        return     ((FObject)receiver).sign((java.security.Signature)(args[0]));
      }
      catch (Throwable t) {
        foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
        logger.error(t.getMessage());
      }

      return null;}
  };

  foam.core.MethodInfo TO_JSON =     new foam.core.MethodInfo(){
    @Override
    public String getName(){
      return "toJSON";
    }
    @Override
    public Object call(foam.core.X x, Object receiver, Object[] args){
      return ((FObject)receiver).toJSON();
    }
  };

  foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()
    .setId("foam.core.FObject").setObjClass(foam.core.FObject.class)
    .addAxiom(FObject.APPEND)
    .addAxiom(FObject.DIFF)
    .addAxiom(FObject.HARD_DIFF)
    .addAxiom(FObject.FCLONE)
    .addAxiom(FObject.DEEP_CLONE)
    .addAxiom(FObject.SHALLOW_CLONE)
    .addAxiom(FObject.COPY_FROM)
    .addAxiom(FObject.GET_PROPERTY)
    .addAxiom(FObject.SET_PROPERTY)
    .addAxiom(FObject.IS_PROPERTY_SET)
    .addAxiom(FObject.HAS_DEFAULT_VALUE)
    .addAxiom(FObject.COMPARE_TO)
    .addAxiom(FObject.VALIDATE)
    .addAxiom(FObject.VERIFY)
    .addAxiom(FObject.BEFORE_FREEZE)
    .addAxiom(FObject.HASH)
    .addAxiom(FObject.SIGN)
    .addAxiom(FObject.TO_JSON);

  default ClassInfo getClassInfo() {
    return classInfo_;
  }

  static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }

  default void append(java.lang.StringBuilder sb) {

    var props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
    var i     = props.iterator();

    while ( i.hasNext() ) {
      PropertyInfo prop = i.next();

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

  }

  default FObject copyFrom(FObject obj) {
    List<PropertyInfo> props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
    for ( PropertyInfo p : props ) {
      try {
        if ( p.isSet(obj) ) p.set(this, p.get(obj));
      } catch (ClassCastException e) {
        try {
          PropertyInfo p2 = (PropertyInfo) obj.getClassInfo().getAxiomByName(p.getName());
          if ( p2 != null ) {
            if ( p2.isSet(obj) ) p.set(this, p2.get(obj));
          }
        } catch (ClassCastException ignore) {}
      }
    }
    return this;
  }

  default FObject fclone() {
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
  }

  default FObject deepClone() {
    return fclone();
  }

  default FObject shallowClone() {
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
  }

  default Map diff(FObject obj) {
    var props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
    var i = props.iterator();

    var result = new HashMap();
    while ( i.hasNext() ) {
      PropertyInfo prop = i.next();
      prop.diff(this, obj, result, prop);
    }

    return result;
  }

  default void beforeFreeze() {

  }

  // Return is FObject that contain different fields between two FObjects.
  default FObject hardDiff(FObject obj) {
    FObject ret;
    boolean isDiff = false;
    try {
      ret = getClass().newInstance();
      var props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
      var i = props.iterator();
      PropertyInfo prop;
      while ( i.hasNext() ) {
        prop = i.next();
        if ( prop.hardDiff(this, obj, ret) ) {
          isDiff = true;
        }
      }
    } catch ( Throwable t ) {
      throw new RuntimeException(t);
    }
    if ( isDiff ) return ret;
    return null;
  }

  default Object setProperty(String prop, Object value) {
    PropertyInfo property = ((PropertyInfo) getClassInfo().getAxiomByName(prop));
    if ( property != null ) property.set(this, value);
    return this;
  }

  default Object getProperty(String prop) {
    PropertyInfo property = ((PropertyInfo) getClassInfo().getAxiomByName(prop));
    return property == null ? null : property.get(this);
  }

  default boolean isPropertySet(String prop) {
    PropertyInfo property = (PropertyInfo) getClassInfo().getAxiomByName(prop);
    return property != null && property.isSet(this);
  }

  default boolean hasDefaultValue(String prop) {
    if ( ! this.isPropertySet(prop) ) return true;
    PropertyInfo property = (PropertyInfo) getClassInfo().getAxiomByName(prop);
    return property != null && property.isDefaultValue(this);
  }

  default int compareTo(Object o) {

    if ( o == this ) return 0;
    if ( o == null ) return 1;
    if ( ! ( o instanceof FObject ) ) return 1;

    if ( getClass() != o.getClass() ) {
      return getClassInfo().getId().compareTo(((FObject)o).getClassInfo().getId());
    }

    var props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
    var i = props.iterator();

    int result;
    while ( i.hasNext() ) {
      result = i.next().compare(this, o);
      if ( result != 0 ) return result;
    }

    return 0;

  }

  default void validate(foam.core.X x) {

    List<PropertyInfo> props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
    for ( PropertyInfo prop : props ) {
      prop.validateObj(x, this);
    }

  }

  default boolean verify(byte[] signature, java.security.Signature verifier) throws java.security.SignatureException {

    var props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
    for (PropertyInfo prop : props) {
      if (!prop.includeInDigest()) continue;
      if (!prop.isSet(this)) continue;
      verifier.update(prop.getNameAsByteArray());
      prop.updateSignature(this, verifier);
    }
    return verifier.verify(signature);

  }

  default byte[] hash(java.security.MessageDigest md) {

    var props = getClassInfo().getAxiomsByClass(PropertyInfo.class);

    for (PropertyInfo prop : props) {
      if (!prop.includeInDigest()) continue;
      if (!prop.isSet(this)) continue;
      md.update(prop.getNameAsByteArray());
      prop.updateDigest(this, md);
    }

    return md.digest();

  }

  default byte[] sign(java.security.Signature signer) throws SignatureException {

    var props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
    for (PropertyInfo prop : props) {
      if (!prop.includeInDigest()) continue;
      if (!prop.isSet(this)) continue;
      signer.update(prop.getNameAsByteArray());
      prop.updateSignature(this, signer);
    }
    return signer.sign();

  }

  default String toJSON() {

    Outputter out = new Outputter(getX());
    return out.stringify(this);

  }

  static FObject maybeClone(FObject fo) {
    return ( fo == null ? null : fo.fclone() );
  }

  // Template method for initializing object after done being built.
  default void init_() {
  }

  // convenience hash function
  default byte[] hash()
    throws NoSuchAlgorithmException
  {
    return this.hash("SHA-256");
  }

  default byte[] hash(String algorithm)
    throws NoSuchAlgorithmException
  {
    return this.hash(MessageDigest.getInstance(algorithm));
  }

  // convenience sign method
  default byte[] sign(PrivateKey key)
    throws NoSuchAlgorithmException, InvalidKeyException, SignatureException
  {
    return this.sign(String.format("SHA256with%s", key.getAlgorithm()), key);
  }

  default byte[] sign(String algorithm, PrivateKey key)
    throws NoSuchAlgorithmException, InvalidKeyException, SignatureException
  {
    Signature signer = Signature.getInstance(algorithm);
    signer.initSign(key, SecurityUtil.GetSecureRandom());
    return this.sign(signer);
  }

  // convenience verify method
  default boolean verify(byte[] signature, PublicKey key)
    throws NoSuchAlgorithmException, InvalidKeyException, SignatureException
  {
    return this.verify(signature, String.format("SHA256with%s", key.getAlgorithm()), key);
  }

  default boolean verify(byte[] signature, String algorithm, PublicKey key)
    throws NoSuchAlgorithmException, InvalidKeyException, SignatureException
  {
    Signature verifier = Signature.getInstance(algorithm);
    verifier.initVerify(key);
    return this.verify(signature, verifier);
  }

  default void assertNotFrozen()
    throws UnsupportedOperationException
  {
    if ( isFrozen() ) throw new UnsupportedOperationException("Object is frozen.");
  }
}
