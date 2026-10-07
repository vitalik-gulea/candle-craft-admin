import type { Category, CategorySummary, CategoryTreeNode } from './types'
import { MAX_CATEGORY_DEPTH } from './types'

export function flattenCategoryTree(nodes: CategoryTreeNode[], depth = 1): CategorySummary[] {
  return nodes.flatMap((node) => [
    { id: node.id, name: node.name, parentId: node.parentId, depth },
    ...flattenCategoryTree(node.children, depth + 1),
  ])
}

export function flattenCategories(nodes: CategoryTreeNode[]): Category[] {
  return nodes.flatMap(({ children, ...category }) => [category, ...flattenCategories(children)])
}

export function getDescendantIds(items: CategorySummary[], id: string): Set<string> {
  const result = new Set<string>()
  const queue = [id]
  while (queue.length > 0) {
    const current = queue.shift()
    for (const item of items) {
      if (item.parentId === current && !result.has(item.id)) {
        result.add(item.id)
        queue.push(item.id)
      }
    }
  }
  return result
}

export function getBranchHeight(items: CategorySummary[], id: string): number {
  const root = items.find((item) => item.id === id)
  if (!root) return 1
  const descendants = getDescendantIds(items, id)
  let maxDepth = root.depth
  for (const item of items) {
    if (descendants.has(item.id)) maxDepth = Math.max(maxDepth, item.depth)
  }
  return maxDepth - root.depth + 1
}

export function getDisabledParentIds(items: CategorySummary[], editingId?: string): Set<string> {
  const disabled = new Set<string>()
  const branchHeight = editingId ? getBranchHeight(items, editingId) : 1
  if (editingId) {
    disabled.add(editingId)
    for (const id of getDescendantIds(items, editingId)) disabled.add(id)
  }
  for (const item of items) {
    if (item.depth + branchHeight > MAX_CATEGORY_DEPTH) disabled.add(item.id)
  }
  return disabled
}

export function filterCategoryTree(
  nodes: CategoryTreeNode[],
  predicate: (node: CategoryTreeNode) => boolean,
): CategoryTreeNode[] {
  return nodes.flatMap((node) => {
    const children = filterCategoryTree(node.children, predicate)
    if (children.length > 0 || predicate(node)) return [{ ...node, children }]
    return []
  })
}
