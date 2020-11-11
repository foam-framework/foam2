/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.boot;

import foam.core.X;
import foam.core.XFactory;
import foam.mlang.predicate.Predicate;

import java.util.ArrayList;
import java.util.List;

public class AltFactory implements XFactory {
  private final String key_;
  private final List<AltDelegate> altDelegates_ = new ArrayList<>();

  public AltFactory(String serviceKey) {
    key_ = serviceKey;
  }

  public void addDelegate(Predicate predicate, String serviceKey) {
    altDelegates_.add(new AltDelegate(predicate, serviceKey));
  }

  @Override
  public Object create(X x) {
    for ( var delegate : altDelegates_ ) {
      if ( delegate.f(x) ) {
        return delegate.get(x);
      }
    }
    return x.get(key_);
  }

  protected class AltDelegate {
    private final Predicate predicate_;
    private final String key_;

    public AltDelegate(Predicate predicate, String serviceKey) {
      predicate_ = predicate;
      key_ = serviceKey;
    }

    public boolean f(X x) {
      return predicate_.f(x);
    }

    public Object get(X x) {
      return x.get(key_);
    }
  }
}
