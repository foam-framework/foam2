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

/**
 * AltFactory allows configuring multiple alternative services for an nspec
 * depending on the associated predicates.
 *
 * Upon invoking the service wrapped with AltFactory, it checks the predicate
 * of each alternative service then returns the service, otherwise, the original
 * service is returned.
 *
 * Example usage: To configure a nspec serviceScript so that it returns
 * "serviceA" when the current user is user(id:1) and "serviceB" for user(id:2)
 * otherwise returns the "defaultService".
 *
 * <pre>
 *   service = new foam.nanos.boot.AltFactory("defaultService");
 *   service.addDelegate(new IsCurrentUser(1), "serviceA");
 *   service.addDelegate(new isCurrentUser(2), "serviceB");
 * </pre>
 */
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
