import { Props, ReactElementType } from 'shared/ReactTypes';
import {
	FiberNode,
	createFiberFromElement,
	createWorkInProgress
} from './fiber';
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { HostText } from './workTag';
import { ChildDeletion, Placement } from './fiberFlags';

/**
 *
 * @param {boolean} shouldTrackEffect
 * 是否最终副作用。即是否生成 Placement 等标签
 * 如果是mount阶段则不用在根节点进行一次placement即可
 *
 * @return {*}
 */
function ChildReconciler(shouldTrackEffect: boolean) {
	function deleteChild(returnFiber: FiberNode, childToDelete: FiberNode) {
		if (!shouldTrackEffect) {
			return;
		}
		const deletions = returnFiber.deletions;
		if (deletions === null) {
			returnFiber.deletions = [childToDelete];
			returnFiber.flags |= ChildDeletion;
		} else {
			deletions.push(childToDelete);
		}
	}

	// 删除剩余的兄弟节点
	function deleteRemainingChildren(
		returnFiber: FiberNode,
		currentFirstChild: FiberNode | null
	) {
		if (!shouldTrackEffect) {
			return;
		}

		let childToDelete = currentFirstChild;

		while (childToDelete !== null) {
			deleteChild(returnFiber, childToDelete);
			childToDelete = childToDelete.sibling;
		}
	}

	// 协调 ReactElement
	// 	当前支持的情况：
	// A1 -> B1
	// A1 -> A2
	// 需要支持的情况：
	// ABC -> A
	// 「单/多节点」是指「更新后是单/多节点」
	// 更细致的，我们需要区分4种情况：
	// key相同，type相同 == 复用当前节点
	// 例如：A1 B2 C3 -> A1
	// key相同，type不同 == 不存在任何复用的可能性
	// 例如：A1 B2 C3 -> B1
	// key不同，type相同  == 当前节点不能复用
	// key不同，type不同 == 当前节点不能复用
	// 对于reconcileSingleTextNode的改动
	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		element: ReactElementType
	) {
		// 是否可以复用 current Fiber
		//	- 比较 key
		// 	- 比较 type
		// 	- 如果都相同则可以复用
		const key = element.key;
		while (currentFiber !== null) {
			// update 情况
			if (currentFiber.key === key) {
				// key 相同
				if (element.$$typeof === REACT_ELEMENT_TYPE) {
					if (element.type === currentFiber.type) {
						// type 相同, 当前节点可以复用
						const existing = useFiber(currentFiber, element.props);
						existing.return = returnFiber;
						// 标记剩余的节点为删除
						deleteRemainingChildren(returnFiber, existing.sibling);
						return existing;
					}
					// key 相同，type不同，不存在任何复用的可能
					// 删除全部的旧节点
					deleteRemainingChildren(returnFiber, currentFiber);
					break;
				} else {
					if (__DEV__) {
						console.warn('未实现的 react element type');
						break;
					}
				}
			} else {
				// key 不同，当前节点不可复用
				// 继续遍历兄弟节点
				deleteChild(returnFiber, currentFiber);
				currentFiber = currentFiber.sibling;
			}
		}

		const fiber = createFiberFromElement(element);
		fiber.return = returnFiber;
		return fiber;
	}

	function reconcileSingleTextNode(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		content: string | number
	) {
		while (currentFiber !== null) {
			// update
			if (currentFiber.tag === HostText) {
				// 类型不变还是 text 类型，则可以复用
				const existing = useFiber(currentFiber, { content });
				existing.return = returnFiber;
				// 其他的兄弟节点都删除掉
				deleteRemainingChildren(returnFiber, existing.sibling);
				return existing;
			}
			// 如 <div/> => hahahah
			// 当前节点类型不是 HostText 删除掉
			deleteChild(returnFiber, currentFiber);
			currentFiber = currentFiber.sibling;
		}
		const fiber = new FiberNode(HostText, { content }, null);
		fiber.return = returnFiber;
		return fiber;
	}

	function placeSingleChild(fiber: FiberNode) {
		if (shouldTrackEffect && fiber.alternate === null) {
			// 如果当前 shouldTrackEffect 说明是 update or mount根元素
			// fiber.alternate === null mount 阶段，还没有 current树
			fiber.flags |= Placement;
		}

		return fiber;
	}

	return function childReconcile(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		newChild?: ReactElementType
	) {
		// ReactElement 类型
		if (typeof newChild === 'object' && newChild !== null) {
			switch (newChild.$$typeof) {
				case REACT_ELEMENT_TYPE:
					return placeSingleChild(
						reconcileSingleElement(returnFiber, currentFiber, newChild)
					);
				default: {
					if (__DEV__) {
						console.warn('未实现的 reconcile 类型', newChild);
					}
				}
			}
		}

		// TODO 多节点情况
		// HostText 类型
		if (typeof newChild === 'string' || typeof newChild === 'number') {
			if (__DEV__) {
				console.warn('reconcile host text component');
			}
			return placeSingleChild(
				reconcileSingleTextNode(returnFiber, currentFiber, newChild)
			);
		}

		if (currentFiber !== null) {
			// 兜底情况 删除节点
			deleteChild(returnFiber, currentFiber);
		}

		if (__DEV__) {
			console.warn('[ChildReconciler]: 未实现的 reconcile 类型', newChild);
		}

		return null;
	};
}

/**
 * 复用 fiber 函数
 * - 创建一个传入 fiber 的克隆
 * - 在 createWorkInProgress 中的双缓存策略会进行 current 和 wip 的反复切换
 */
function useFiber(fiber: FiberNode, pendingProps: Props) {
	const clone = createWorkInProgress(fiber, pendingProps);
	clone.index = 0;
	clone.sibling = null;
	return clone;
}

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildReconcile = ChildReconciler(false);
