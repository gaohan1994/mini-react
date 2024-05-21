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

	// 协调 ReactElement
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
		work: if (currentFiber !== null) {
			// update 情况
			if (currentFiber.key === key) {
				// key 相同
				if (element.$$typeof === REACT_ELEMENT_TYPE) {
					if (element.type === currentFiber.type) {
						// type 相同, 应该复用
						const existing = useFiber(currentFiber, element.props);
						existing.return = returnFiber;
						return existing;
					}
					// 不可复用，删除旧的，创建新的
					deleteChild(returnFiber, currentFiber);
					break work;
				} else {
					if (__DEV__) {
						console.warn('未实现的 react element type');
						break work;
					}
				}
			} else {
				// 不可复用，删除旧的，创建新的
				deleteChild(returnFiber, currentFiber);
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
		if (currentFiber !== null) {
			// update
			if (currentFiber.tag === HostText) {
				// 类型不变还是 text 类型，则可以复用
				const existing = useFiber(currentFiber, { content });
				existing.return = returnFiber;
				return existing;
			}
			// 如 <div/> => hahahah
			deleteChild(returnFiber, currentFiber);
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
