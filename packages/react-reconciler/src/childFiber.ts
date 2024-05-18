import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode, createFiberFromElement } from './fiber';
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { HostComponent } from './workTag';
import { Placement } from './fiberFlags';

/**
 *
 * @param {boolean} shouldTrackEffect
 * 是否最终副作用。即是否生成 Placement 等标签
 * 如果是mount阶段则不用在根节点进行一次placement即可
 *
 * @return {*}
 */
function ChildReconciler(shouldTrackEffect: boolean) {
	// 协调 ReactElement
	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		element: ReactElementType
	) {
		const fiber = createFiberFromElement(element);
		fiber.return = returnFiber;
		return fiber;
	}

	function reconcileSingleTextNode(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		content: string | number
	) {
		const fiber = new FiberNode(HostComponent, { content }, null);
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
						console.warn('为实现的 reconsile 类型', newChild);
					}
				}
			}
		}

		// TODO 多节点情况

		// HostText 类型
		if (typeof newChild === 'string' || typeof newChild === 'number') {
			return placeSingleChild(
				reconcileSingleTextNode(returnFiber, currentFiber, newChild)
			);
		}

		if (__DEV__) {
			console.warn('为实现的 reconsile 类型', newChild);
		}

		return null;
	};
}

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildReconcile = ChildReconciler(false);
