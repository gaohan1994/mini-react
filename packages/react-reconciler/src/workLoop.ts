import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { FiberNode, FiberRootNode, createWorkInProgess } from './fiber';
import { HostRoot } from './workTag';

let workInProgress: FiberNode | null = null;

function prepareFreshStack(root: FiberRootNode) {
	workInProgress = createWorkInProgess(root.current, {});
}

/**
 * 在 Fiber 中调度 update
 */
export function schduleUpdateOnFiber(fiber: FiberNode) {
	// update 是从根节点开始更新，所以先找到根节点
	const root = makeUpdateFromFiberToRoot(fiber);
	renderRoot(root);
}

/**
 * 找到跟节点
 * fiberRootNode.current = hostRootFiber;
 * hostRootFiber.stateNode = fiberRootNode;
 *
 * 只有 hostRootFiber 是特殊的，因为他没有 return
 */
function makeUpdateFromFiberToRoot(fiber: FiberNode): FiberNode | null {
	let node = fiber;
	let parent = node.return;

	while (parent !== null) {
		node = parent;
		parent = node.return;
	}

	if (node.tag === HostRoot) {
		return node.stateNode;
	}

	return null;
}

/**
 * 谁来调用 renderRoot
 * 更新机制调用
 * @param root
 */
function renderRoot(root: FiberNode) {
	// 初始化
	prepareFreshStack(root);

	do {
		try {
			workLoop();
			break;
		} catch (error) {
			if (__DEV__) {
				console.warn('work loop 发生错误', error);
			}
			workInProgress = null;
		}
	} while (true);
}

function workLoop() {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress);
	}
}

function performUnitOfWork(fiber: FiberNode) {
	const next = beginWork(fiber);
	fiber.memoizedProps = fiber.pendingProps;

	if (next === null) {
		// 如果没有子节点，则执行归的过程
		completeUnitOfWork(fiber);
	} else {
		// 如果有子节点，则继续对子节点进行递的过程
		workInProgress = next;
	}
}

function completeUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;
	do {
		completeWork(node);

		// 如果有兄弟节点则递兄弟节点
		const sibling = node.sibling;
		if (sibling !== null) {
			workInProgress = sibling;
			return;
		}

		// 没有兄弟节点则说明当前阶段工作结束
		// 这里有点疑惑?
		node = node.return;
		workInProgress = node;
	} while (node !== null);
}
