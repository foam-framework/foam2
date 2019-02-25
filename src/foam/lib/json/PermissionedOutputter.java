package foam.lib.json;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.nanos.auth.AuthService;

public class PermissionedOutputter extends Outputter {
  protected foam.core.X x_;
  protected AuthService auth;

  public PermissionedOutputter(foam.core.X x, OutputterMode mode) {
    super(mode);
    this.x_ = x;
    this.auth = (AuthService) x.get("auth");
  }

  @Override
  protected boolean propertyPredicate(FObject fo, PropertyInfo prop) {
    if ( prop.getPermissionRequired() ) {
      String propName = prop.getName().toLowerCase();
      String of = fo.getClass().getSimpleName().toLowerCase();
      return this.auth.check(this.x_,  of + ".ro." + propName) || auth.check(this.x_,  of + ".rw." + propName);
    }
    return super.propertyPredicate(fo, prop);
  }
}
