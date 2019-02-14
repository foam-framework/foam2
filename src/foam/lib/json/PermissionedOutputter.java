package foam.lib.json;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.nanos.auth.AuthService;

public class PermissionedOutputter extends Outputter {
  protected foam.core.X x_;

  public PermissionedOutputter(foam.core.X x, OutputterMode mode) {
    super(mode);
    this.x_ = x;
  }

  @Override
  protected boolean propertyPredicate(FObject fo, PropertyInfo prop) {
    if ( prop.getPermissionRequired() ) {
      AuthService auth = (AuthService) this.x_.get("auth");
      String propName = prop.toString();
      propName = propName.substring(propName.lastIndexOf(".") + 1).toLowerCase();
      String of = fo.getClass().getSimpleName().toLowerCase();
      return auth.check(this.x_,  of + ".ro." + propName) || auth.check(this.x_,  of + ".rw." + propName);
    }
    return super.propertyPredicate(fo, prop);
  }
}
