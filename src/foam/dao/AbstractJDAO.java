/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.lib.json.Outputter;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

import java.text.SimpleDateFormat;
import java.util.TimeZone;

public abstract class AbstractJDAO
  extends ProxyDAO
{
  protected static final ThreadLocal<SimpleDateFormat> sdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
      sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
      return sdf;
    }
  };

  protected Journal journal_;

  public AbstractJDAO(foam.core.X x, DAO delegate, String filename) {
    setX(x);
    setOf(delegate.getOf());
    setDelegate(delegate);

    // create journal
    journal_ = new FileJournal.Builder(getX())
      .setFilename(filename)
      .setCreateFile(true)
      .build();

    // create a composite journal of repo journal
    // and runtime journal and load them all
    new CompositeJournal.Builder(getX())
      .setDelegates(new Journal[]{
        new FileJournal.Builder(getX())
          .setFilename(filename + ".0")
          .build(),
        new FileJournal.Builder(getX())
          .setFilename(filename)
          .build()
      })
      .build().replay(delegate);
  }

  protected abstract Outputter getOutputter();

  /**
   * persists data into FileJournal then calls the delegated DAO.
   *
   * @param obj
   * @returns FObject
   */
  @Override
  public synchronized FObject put_(X x, FObject obj) {
    PropertyInfo id     = (PropertyInfo) getOf().getAxiomByName("id");
    FObject      o      = getDelegate().find_(x, id.get(obj));
    FObject      ret    = null;

    if ( o == null ) {
      // data does not exist
      ret = getDelegate().put_(x, obj);
      // stringify to json string
      journal_.put(ret, null);
    } else {
      // compare with old data if old data exists
      // get difference FObject
      ret = difference(o, obj);
      // if no difference, then return
      if ( ret == null ) return obj;
      // stringify difference FObject into json string
      journal_.put(ret, null);
      // put new data into memory
      ret = getDelegate().put_(x, obj);
    }

    return ret;
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    Object  id  = getPrimaryKey().get(obj);
    FObject ret = getDelegate().remove_(x, obj);

    if ( ret == null ) {
      // TODO: log
      return ret;
    }

    // TODO: Would be more efficient to output the ID portion of the object.  But
    // if ID is an alias or multi part id we should only output the
    // true properties that ID/MultiPartID maps too.
    FObject r = generateFObject(ret);
    PropertyInfo idInfo = (PropertyInfo) getOf().getAxiomByName("id");
    idInfo.set(r, idInfo.get(ret));
    journal_.put(r, null);
    return ret;
  }

  @Override
  public void removeAll_(final X x, long skip, final long limit, Comparator order, Predicate predicate) {
    getDelegate().select_(x, new RemoveSink(x, this), skip, limit, order, predicate);
    getDelegate().removeAll_(x, skip, limit, order, predicate);
  }

  protected FObject difference(FObject o, FObject n) {
    FObject diff = o.hardDiff(n);
    // no difference, then return null
    if ( diff == null ) return null;
    // get the PropertyInfo for the id
    PropertyInfo idInfo = (PropertyInfo) getOf().getAxiomByName("id");
    // set id property to new instance
    idInfo.set(diff, idInfo.get(o));
    return diff;
  }

  //return a new Fobject
  protected FObject generateFObject(FObject o) {
    try {
      ClassInfo classInfo = o.getClassInfo();
      //create a new Instance
      FObject ret = (FObject) classInfo.getObjClass().newInstance();

      return ret;
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }
}
