import { appendChildToContainer, Container } from 'hostConfig';
import { FiberNode, FiberRootNode } from './fiber';
import { MutationMask, NoFlags, Placement } from './fiberFlags';
import { HostComponent, HostRoot, HostText } from './workTag';

let nextEffect: FiberNode | null = null;

/**
 * 要做的事情：
 * 找到带有 flag 的节点并执行对应的操作
 *
 * 如何找到带有 flag 的节点?
 * 遍历
 * @param finishedWork
 */
export const commitMutationEffects = (finishedWork: FiberNode) => {
	nextEffect = finishedWork;

	/**
	 * 向下遍历找到含有 MutationMask flag 的相应节点
	 * 本质上是一个 DFS 深度优先遍历
	 */
	while (nextEffect !== null) {
		const child: FiberNode | null = nextEffect.child;
		if (
			(nextEffect.subtreeFlags & MutationMask) !== NoFlags &&
			child !== null
		) {
			// (nextEffect.subtreeFlags & MutationMask) !== NoFlags => 当前节点的子树出现了 mutation 的操作
			// child !== null 且子节点不等于 null
			// 则向下遍历
			nextEffect = child;
		} else {
			up: while (nextEffect !== null) {
				// 当前节点没有出现 subtree mutation 的操作
				// 或者 child === null
				commitMutationEffectsOnFiber(nextEffect);

				const sibling: FiberNode | null = nextEffect.sibling;
				// 如果有兄弟节点，则说明当前节点还不是最下面的节点，继续遍历兄弟节点
				if (sibling !== null) {
					nextEffect = sibling;
					break up;
				}

				// 则应该向上遍历
				nextEffect = nextEffect.return;
			}
		}
	}
};

/**
 * 对 fiber 对象执行对应的操作
 */
const commitMutationEffectsOnFiber = (finishedWork: FiberNode) => {
	const flags = finishedWork.flags;

	if ((flags & Placement) !== NoFlags) {
		// 当前 fiber 具有 placement 标签
		// 需要对 fiber 执行对应的操作
		// 获得 parent 的 dom 节点，然后执行插入操作
		commitPlacement(finishedWork);
		finishedWork.flags &= ~Placement;
	}
};

const commitPlacement = (finishedWork: FiberNode) => {
	if (__DEV__) {
		console.warn('执行 placement 操作', finishedWork);
	}

	// 找到父节点
	const hostParent = getHostParent(finishedWork);
	// 插入
	if (hostParent !== null) {
		appendPlacementNodeIntoContainer(finishedWork, hostParent);
	}
};

// 找到 fiber 对象 parent 对应的 dom
const getHostParent = (fiber: FiberNode): Container | null => {
	let parent = fiber.return;

	while (parent !== null) {
		const parentTag = parent.tag;
		if (parentTag === HostComponent) {
			return parent.stateNode;
		}
		if (parentTag === HostRoot) {
			return (parent.stateNode as FiberRootNode).container;
		}

		parent = parent.return;
	}

	if (__DEV__) {
		console.warn('未找到 parent 对应 state node');
	}
	return null;
};

const appendPlacementNodeIntoContainer = (
	finishedWork: FiberNode,
	hostParent: Container
) => {
	if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
		appendChildToContainer(hostParent, finishedWork.stateNode);
		return;
	}

	const child = finishedWork.child;
	if (child !== null) {
		appendPlacementNodeIntoContainer(child, hostParent);

		let sibling = child.sibling;
		while (sibling !== null) {
			appendPlacementNodeIntoContainer(sibling, hostParent);
			sibling = sibling.sibling;
		}
	}
};
