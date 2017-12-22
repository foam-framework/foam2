/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao.index;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.dao.AbstractDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import static foam.dao.AbstractDAO.decorateSink_;
import foam.mlang.predicate.Binary;
import foam.mlang.predicate.True;

public class TreeNode {

  protected Object key;
  protected Object value;
  protected long size;
  protected long level;
  protected TreeNode left;
  protected TreeNode right;

  protected final static TreeNode NULL_NODE = new TreeNode(null, null,
                                                          0, 0, null, null);

  public TreeNode(Object key, Object value) {
    this.key = key;

    this.value = value;
  }

  public TreeNode(Object key, Object value, long size, long level,
                  TreeNode left, TreeNode right) {
    this.key = key;
    this.value = value;
    this.size = size;
    this.level = level;
    this.left = left;
    this.right = right;
  }

  public TreeNode cloneNode() {
    return new TreeNode( this.key, this.value, this.size,
                               this.level, this.left, this.right);

  }

  private TreeNode maybeClone(TreeNode s) {
    if ( s != null ) {
      return s.cloneNode();
    }
    return s;
  }

  public static TreeNode getNullNode() {
    return NULL_NODE;
  }

  public Object bulkLoad(Index tail, PropertyInfo prop, int start, int end, FObject[] a) {
    if ( end < start ) {
      return null;
    }
    int m = start + (int) Math.floor((end-start+1)/2);
    TreeNode tree = this.putKeyValue(this, prop, prop.f(a[m]), a[m], tail);
    tree.left = (TreeNode) this.bulkLoad(tail, prop, start, m-1, a);
    tree.right = (TreeNode) this.bulkLoad(tail, prop, m+1, end, a);
    tree.size = this.size(tree.left) + this.size(tree.right);
    return tree;
  }

  public TreeNode putKeyValue(TreeNode state, PropertyInfo prop, Object key,
    FObject value, Index tail) {
    if ( state == null || state.equals(TreeNode.getNullNode()) ) {
      return new TreeNode(key, tail.put(null, value), 1, 1, null, null);
    }
    state = maybeClone(state);
    int r = prop.comparePropertyToValue(key,state.key);

    if ( r == 0 ) {
      state.size -= tail.size(state.value);
      state.value = tail.put(state.value, value);
      state.size += tail.size(state.value);
    } else {
      if ( r < 0 ) {
        if ( state.left != null ) {
          state.size -= state.left.size;
        }
        state.left = this.putKeyValue(state.left, prop, key, value, tail);
        state.size += state.left.size;
      } else {
        if ( state.right != null ) {
          state.size -= state.right.size;
        }
        state.right = this.putKeyValue(state.right, prop, key, value, tail);
        state.size += state.right.size;
      }
    }
    return split(skew(state, tail), tail);
  }

  public TreeNode skew(TreeNode node, Index tail) {
    if ( node != null && node.left != null && node.left.level == node.level ) {
      // Swap the pointers of horizontal left links.
      TreeNode l = maybeClone(node.left);

      node.left = l.right;
      l.right = node;

      node = updateSize(node, tail);
      l = updateSize(l, tail);
      return l;
    }
    return node;
  }

  public TreeNode split(TreeNode node, Index tail) {
    if ( node != null && node.right != null && node.right.right != null &&
        node.level == node.right.right.level ) {
      // Swap the pointers of horizontal left links.
      TreeNode r = maybeClone(node.right);

      node.right = r.left;
      r.left = node;
      r.level++;

      node = updateSize(node, tail);
      r = updateSize(r, tail);
      return r;
    }
    return node;
  }

  public TreeNode removeKeyValue(TreeNode state, PropertyInfo prop, Object key,
    FObject value, Index tail) {
    if ( state == null ) {
      return state;
    }

    state = maybeClone(state);
    long compareValue = prop.comparePropertyToValue(key,state.key);

    if ( compareValue == 0 ) {
      state.size -= tail.size(state.value);
      state.value = tail.remove(state.value, value);

      if ( state.value != null ) {
        state.size += tail.size(state.value);
        return state;
      }

      if ( state.left == null && state.right == null ) {
        return null;
      }
      boolean isLeft = ( state.left != null );
      TreeNode subs = isLeft ? predecessor(state) : successor(state);
      state.key = subs.key;
      state.value = subs.value;
      if ( isLeft ) {
        state.left = removeNode(state.left, subs.value, prop);
      } else {
        state.right = removeNode(state.right, subs.value, prop);
      }
    } else {
      if ( compareValue > 0 ) {
        state.size -= size(state.left);
        state.left = removeKeyValue(state.left, prop, key, value, tail);
        state.size += size(state.left);
      } else {
        state.size -= size(state.right);
        state.right = removeKeyValue(state.right, prop, key, value, tail);
        state.size += size(state.right);
      }
    }
    // Rebalance the tree. Decrease the level of all nodes in this level if
    // necessary, and then skew and split all nodes in the new level.
    state = skew(decreaseLevel(state), tail);
    if ( state.right != null ) {
      state.right = skew(maybeClone(state.right), tail);
      if ( state.right.right != null ) {
        state.right.right = skew(maybeClone(state.right.right), tail);
      }
    }
    state = split(state, tail);
    state.right = split(maybeClone(state.right), tail);

    return state;
  }

  private TreeNode removeNode(TreeNode state, Object key, PropertyInfo prop) {
    if ( state == null ) {
      return state;
    }
    state  = maybeClone(state);
    long compareValue = prop.comparePropertyToValue(state.key, key);

    if ( compareValue == 0 ) {
      return state.left != null ? state.left : state.right;
    }
    if ( compareValue > 0 ) {
      state.size -= size(state.left);
      state.left = removeNode(state.left, key, prop);
      state.size += size(state.left);
    } else {
      state.size -= size(state.right);
      state.right = removeNode(state.right, key, prop);
      state.size += size(state.right);
    }
    return state;
  }

  private TreeNode predecessor(TreeNode node) {
    if ( node.left == null ) {
      return node;
    }
    node = node.left;
    while ( node.right != null ) {
      node = node.right;
    }
    return node;
  }

  private TreeNode successor(TreeNode node) {
    if ( node.right == null ) {
      return node;
    }
    node = node.right;
    while ( node.left != null ) {
      node = node.left;
    }
    return node;
  }

  private TreeNode decreaseLevel(TreeNode node) {
    long expectedLevel = 1 + Math.min(
      node.left != null ? node.left.level : 0 ,
      node.right != null ? node.right.level : 0);

    if ( expectedLevel < node.level ) {
      node.level = expectedLevel;
      if ( node.right != null && expectedLevel < node.right.level ) {
        node.right = maybeClone(node.right);
        node.right.level = expectedLevel;
      }
    }
    return node;
  }

  private TreeNode updateSize(TreeNode node, Index tail) {
    node.size = size(node.left) + size(node.right) + tail.size(node.value);
    return node;
  }

  private long size (TreeNode node) {
    if ( node != null ) {
      return node.size;
    }
    return 0;
  }

  public TreeNode get(TreeNode s, Object key, PropertyInfo prop) {
    if ( s == null ) {
      return s;
    }

    int r = prop.comparePropertyToValue(key, s.key);
    if ( r == 0 ) {
      long size = s.value instanceof TreeNode ? ( (TreeNode) s.value ).size : 1;
      return new TreeNode(s.key, s.value, size, 0, null, null);
    }
    if ( r > 0 ) {
      return get(s.right, key, prop);
    }
    return get(s.left, key, prop);
  }

  protected TreeNode getLeft() {
    return left;
  }

  protected TreeNode getRight(){
    return right;
  }

  protected Object getValue(){
    return value;
  }

  public TreeNode neq(TreeNode s, Object key, PropertyInfo prop) {
    return removeNode(s, key, prop);
  }

  public TreeNode gt(TreeNode s, Object key, PropertyInfo prop) {
    if ( s == null ) {
      return s;
    }
    int r = prop.comparePropertyToValue(key, s.key);
    if ( r < 0 ) {
      TreeNode l = gt(s.left, key, prop);
      long newSize = size(s) - size(s.left) + size(l);
      return new TreeNode(s.key, s.value, newSize,
        s.level, l, s.right);
    }
    if ( r > 0 ) {
      return gt(s.right, key, prop);
    }

    return s.right;
  }

  public TreeNode gte(TreeNode s, Object key, PropertyInfo prop) {
    if ( s == null ) {
      return s;
    }
    int r = prop.comparePropertyToValue(key, s.key);
    if ( r < 0 ) {
      TreeNode l = gte(s.left, key, prop);
      long newSize = size(s) - size(s.left) + size(l);
      return new TreeNode(s.key, s.value, newSize,
        s.level, l, s.right);
    }
    if ( r > 0 ) {
      return gte(s.right, key, prop);
    }

    return new TreeNode(s.key, s.value, size(s) - size(s.left),
      s.level, null, s.right);
  }

  public TreeNode lt(TreeNode s, Object key, PropertyInfo prop) {
    if ( s == null ) {
      return s;
    }
    int r = prop.comparePropertyToValue(key, s.key);
    if ( r > 0 ) {
      TreeNode right = lt(s.right, key, prop);
      long newSize = size(s) - size(s.right) + size(right);
      return new TreeNode(s.key, s.value, newSize,
        s.level, s.left, right);
    }
    if ( r < 0 ) {
      return lt(s.left, key, prop);
    }

    return  s.left;
  }

  public TreeNode lte(TreeNode s, Object key, PropertyInfo prop) {
    if ( s == null ) {
      return s;
    }
    int r = prop.comparePropertyToValue(key, s.key);
    if ( r > 0 ) {
      TreeNode right = lte(s.right, key, prop);
      long newSize = size(s) - size(s.right) + size(right);
      return new TreeNode(s.key, s.value, newSize,
        s.level, s.left, right);
    }
    if ( r < 0 ) {
      return lte(s.left, key, prop);
    }

    return new TreeNode(s.key, s.value, size(s) - size(s.right),
      s.level, s.left, null);
  }

  protected void select_(TreeNode currentNode, Sink sink, long skip, long limit, long size, Index tail) {
    if ( currentNode == null ) return;
    TreeNode left = currentNode.getLeft();
    if ( left != null ) {
      select_(left, sink, skip, limit, size, tail);
    }
    Object value = currentNode.getValue();
    if ( value != null ) {
      tail.planSelect(value, sink, 0, AbstractDAO.MAX_SAFE_INTEGER, null, null).select(value, sink, 0, AbstractDAO.MAX_SAFE_INTEGER, null, null);
    }
    TreeNode right = currentNode.getRight();
    if ( right != null ) {
      select_(right, sink, skip, limit, size, tail);
    }
  }

  protected long[] skipLimitTreeNode(TreeNode currentNode, Sink sink, long skip, long limit, long size, Index tail) {
    if ( currentNode == null || size <= skip || limit <= 0 ) return new long[]{- 1, - 1};
    long currentSize = currentNode.size;
    TreeNode left = currentNode.getLeft();
    long leftSize = 0;
    long[] skip_limit = new long[]{skip, limit}; //skip_limit[0]: skip, skip_limit[1]: limit
    if ( left != null ) {
      leftSize = left.size;
      if ( leftSize > skip ) {
        skip_limit = skipLimitTreeNode(left, sink, skip_limit[0], skip_limit[1], size, tail);
      } else if ( leftSize == skip ) skip_limit[0] = 0;
      else {
        skip_limit[0] = skip_limit[0] - leftSize;
      }
    }
    Object value = currentNode.getValue();
    if ( tail.size(currentNode) > skip_limit[0] && skip_limit[1] > 0 ) {
      tail.planSelect(value, sink, skip_limit[0], skip_limit[1], null, null).select(value, sink, skip_limit[0], skip_limit[1], null, null);
      skip_limit[0] = 0;
      skip_limit[1] = skip_limit[1] - ( tail.size(currentNode) - skip_limit[0] );
    } else if ( tail.size(currentNode) == skip_limit[0] ) {
      skip_limit[0] = 0;
    } else {
      skip_limit[0] = skip_limit[0] - tail.size(currentNode);
    }
    TreeNode right = currentNode.getRight();
    if ( right != null ) {
      skip_limit = skipLimitTreeNode(right, sink, skip_limit[0], skip_limit[1], size, tail);
    }
    return skip_limit;
  }

  protected long[] reverseSortSkipLimitTreeNode(TreeNode currentNode, Sink sink, long skip, long limit, long size, Index tail) {
    if ( currentNode == null || size <= skip || limit <= 0 ) return new long[]{- 1, - 1};
    long currentSize = currentNode.size;
    TreeNode right = currentNode.getRight();
    long rightSize = 0;
    long[] skip_limit = new long[]{skip, limit};
    if ( right != null ) {
      rightSize = right.size;
      if ( rightSize > skip ) {
        skip_limit = reverseSortSkipLimitTreeNode(right, sink, skip_limit[0], skip_limit[1], size, tail);
      } else if ( rightSize == skip ) skip_limit[0] = 0;
      else {
        skip_limit[0] = skip_limit[0] - rightSize;
      }
    }
    Object value = currentNode.getValue();
    if ( tail.size(currentNode) > skip_limit[0] && skip_limit[1] > 0 ) {
      tail.planSelect(value, sink, skip_limit[0], skip_limit[1], null, null).select(value, sink, skip_limit[0], skip_limit[1], null, null);
      skip_limit[0] = 0;
      skip_limit[1] = skip_limit[1] - ( tail.size(currentNode) - skip_limit[0] );
    } else if ( tail.size(currentNode) == skip_limit[0] ) {
      skip_limit[0] = 0;
    } else {
      skip_limit[0] = skip_limit[0] - tail.size(currentNode);
    }
    TreeNode left = currentNode.getLeft();
    if ( left != null ) {
      skip_limit = reverseSortSkipLimitTreeNode(left, sink, skip_limit[0], skip_limit[1], size, tail);
    }
    return skip_limit;
  }

  public void select(TreeNode currentNode, Sink sink, long skip, long limit, Comparator order, Predicate predicate, Index tail, boolean reverseSort) {
    if ( skip >= currentNode.size || limit <= 0 ) return;
    if ( ( predicate != null && predicate.partialEval() != null && ! ( predicate instanceof True ) ) || order != null ) {
      if ( order == null ) {
        if ( reverseSort ) {
          sink = decorateSink_(sink, skip, limit, null, predicate);
          reverseSortSkipLimitTreeNode(currentNode, sink, 0, AbstractDAO.MAX_SAFE_INTEGER, size, tail);
          sink.eof();
        } else {
          sink = decorateSink_(sink, skip, limit, null, predicate);
          select_(currentNode, sink, skip, limit, size, tail);
          sink.eof();
        }
      } else {
        sink = decorateSink_(sink, skip, limit, order, predicate);
        select_(currentNode, sink, skip, limit, size, tail);
        sink.eof();
      }
    } else if ( ! reverseSort ) {
      skipLimitTreeNode(currentNode, sink, skip, limit, size, tail);
    } else {
      reverseSortSkipLimitTreeNode(currentNode, sink, skip, limit, size, tail);
    }
  }

}
