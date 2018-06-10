/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.X;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.TimeZone;

public class JDAO
  extends ProxyDAO
{
  protected static ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder b = super.get();
      b.setLength(0);
      return b;
    }
  };

  protected static final ThreadLocal<SimpleDateFormat> sdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
      sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
      return sdf;
    }
  };

  protected FileJournal journal_;

  public JDAO(X x, ClassInfo classInfo, String filename) {
    this(x, new MapDAO(classInfo), filename);
  }

  public JDAO(X x, DAO delegate, String filename) {
    setX(x);
    setOf(delegate.getOf());
    setDelegate(delegate);

    // create journal
    journal_ = new FileJournal.Builder(getX())
      .setDao(delegate)
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

  @Override
  public FObject put_(X x, FObject obj) {
    writeComment((User) x.get("user"));
    journal_.put(obj, null);
    return getDelegate().put_(x, obj);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    writeComment((User) x.get("user"));
    journal_.remove(obj, null);
    return getDelegate().remove_(x, obj);
  }

  @Override
  public void removeAll_(final X x, long skip, final long limit, Comparator order, Predicate predicate) {
    getDelegate().select_(x, new RemoveSink(x, this), skip, limit, order, predicate);
    getDelegate().removeAll_(x, skip, limit, order, predicate);
  }

  /**
   * Writes comment explaining who modified entry
   *
   * @param user user who modified entry
   */
  protected void writeComment(User user) {
    journal_.write_(sb.get()
      .append("// Modified by ")
      .append(user.label())
      .append(" (")
      .append(user.getId())
      .append(") at ")
      .append(sdf.get().format(Calendar.getInstance().getTime()))
      .toString());
  }
}
