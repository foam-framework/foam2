package foam.nanos.auth;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.mlang.MLang;
import foam.util.SafetyUtil;

import java.util.ArrayList;
import java.util.function.BiConsumer;

public class UpdateChildEmailSetting extends ProxyDAO {

  public UpdateChildEmailSetting(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Group group    = (Group) obj;
    Group oldGroup = (Group) this.getDelegate().find_(x, group.getId());

    if ( oldGroup == null ) {
      return super.put_(x, obj);
    }

    if ( ! SafetyUtil.equals(group.getDisplayName(), oldGroup.getDisplayName()) ) {
      updateChildEmailSetting(x, group,
        (childGroup, parentGroup) -> childGroup.setDisplayName(parentGroup.getDisplayName()));
    }

    if ( ! SafetyUtil.equals(group.getFrom(), oldGroup.getFrom()) ) {
      updateChildEmailSetting(x, group,
        (childGroup, parentGroup) -> childGroup.setFrom(parentGroup.getFrom()));
    }

    if ( ! SafetyUtil.equals(group.getReplyTo(), oldGroup.getReplyTo()) ) {
      updateChildEmailSetting(x, group,
        (childGroup, parentGroup) -> childGroup.setReplyTo(parentGroup.getReplyTo()));
    }

    return super.put_(x, obj);
  }

  @Override
  public FObject find_(X x, Object id) {
    Group group = (Group) super.find_(x, id);

    if ( group == null ) {
      return group;
    }

    if ( SafetyUtil.isEmpty(group.getFrom()) ||
         SafetyUtil.isEmpty(group.getDisplayName()) ||
         SafetyUtil.isEmpty(group.getReplyTo())) {

      getParentValue(x, group, group);
      return super.find_(x, id);
    }

    return group;
  }

  public void updateChildEmailSetting(X x, Group group, BiConsumer<Group, Group> update) {

    ArraySink sink = (ArraySink) this.getDelegate().where(MLang.EQ(
      Group.PARENT, group.getId()
    )).select(new ArraySink());

    ArrayList<Group> childGroups = (ArrayList) sink.getArray();

    if ( childGroups.size() == 0 ) {
      return;
    }

    // DFS traverse update all the child value
    for ( Group child : childGroups ) {

      child = (Group) child.fclone();
      update.accept(child, group);
      this.getDelegate().put_(x, child);

      updateChildEmailSetting(x, child, update);
    }

  }

  public void getParentValue(X x, Group childGroup, Group parentGroup) {

    if ( parentGroup == null ) {
      return;
    }

    if ( ! SafetyUtil.isEmpty(parentGroup.getFrom()) ||
      ! SafetyUtil.isEmpty(parentGroup.getDisplayName()) ||
      ! SafetyUtil.isEmpty(parentGroup.getReplyTo())) {

      childGroup = (Group) childGroup.fclone();
      childGroup.setFrom(parentGroup.getFrom());
      childGroup.setDisplayName(parentGroup.getDisplayName());
      childGroup.setReplyTo(parentGroup.getReplyTo());

      this.getDelegate().put_(x, childGroup);

      return;
    }

    parentGroup = (Group) this.getDelegate().find_(x, parentGroup.getParent());
    getParentValue(x, childGroup, parentGroup);
  }

}
