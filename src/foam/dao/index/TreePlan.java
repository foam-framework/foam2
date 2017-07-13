package foam.dao.index;

import foam.core.FObject;
import foam.core.PropertyInfo;

public class TreePlan implements FindPlan {
  
  protected PropertyInfo prop_;
  
  public TreePlan(PropertyInfo prop) {
    prop_ = prop;
  }
  //TODO
  public long cost() {
    return 1;
  }
  
  public FObject find(Object state, Object key) {
    if ( state != null ) {
      return (FObject)((TreeNode) state).get(((TreeNode) state), key, prop_);
    }
    return null;
  }

}
