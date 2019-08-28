package foam.nanos.ruler.test;

import foam.mlang.predicate.AbstractPredicate;

/**
 * DummyErroneousPredicate - always throws exception when evaluated.
 */
public class DummyErroneousPredicate extends AbstractPredicate {

  @Override
  public boolean f(Object obj) {
    throw new RuntimeException(getClass().getSimpleName());
  }
}
