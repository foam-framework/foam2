package foam.dao.index;

import foam.core.FObject;
import foam.core.PropertyInfo;

public class TreeLookupFindPlan implements FindPlan {
  
  protected PropertyInfo prop_;
  
  public TreeLookupFindPlan(PropertyInfo prop) {
    prop_ = prop;
  }
  //TODO
  public long cost() {
    return 1;
  }
  
  public FObject find(Object state, Object key) {
    if ( state != null && state instanceof TreeNode ) {
      return (FObject)((TreeNode) state).get(((TreeNode) state), key, prop_);
    }
    if ( state != null && state instanceof Object[] &&
         ((Object[]) state).length > 0 ) {
      return (FObject)((TreeNode) ((Object[]) state)[0]).get(((TreeNode) ((Object[]) state)[0]), key, prop_);
    }
    return null;
  }

}
