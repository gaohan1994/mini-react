import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode } from './fiber';
import { UpdateQueue, processUpdateQueue } from './updateQueue';
import { HostComponent, HostRoot, HostText } from './workTag';
import { mountChildReconcile, reconcileChildFibers } from './childFiber';

// 递归中的递阶段
// wip: workInProgress
export const beginWork = (wip: FiberNode) => {
	// 比较ReactElement和FiberNode并生成子FiberNode

	switch (wip.tag) {
		case HostRoot:
			return updateHostRoot(wip);

		case HostComponent:
			return updateHostComponent(wip);

		// 叶子节点了，没有子节点了，return null 要执行归阶段了
		case HostText:
			return null;

		default:
			if (__DEV__) {
				console.warn('没有实现的 wip tag 类型');
			}
			return;
	}
};

// 更新 host root 并返回生成的字 FiberNode
const updateHostRoot = (wip: FiberNode) => {
	// 准备更新的参数
	// 上一次 memoizedState 作为这次更新的 baseState
	const baseState = wip.memoizedState;
	// 因为是 HostRoot 所以 updateQueue 的类型是 Element 也就是 render(<App/>) 中的 <App/>
	const updateQueue = wip.updateQueue as UpdateQueue<Element>;

	const pending = updateQueue.shared.pendding;
	// 调用封装好的更新函数
	const { memoizedState } = processUpdateQueue(baseState, pending);
	wip.memoizedState = memoizedState;

	const nextChildren = wip.memoizedState;
	reconcileChildren(wip, nextChildren);
	return wip.child;
};

// HostComponent 即原生 Dom 类型组件如 div span 等组件
const updateHostComponent = (wip: FiberNode) => {
	const nextProps = wip.pendingProps;
	const nextChildren = nextProps.children;
	reconcileChildren(wip, nextChildren);
	return wip.child;
};

const reconcileChildren = (wip: FiberNode, children?: ReactElementType) => {
	const current = wip.alternate;
	/**
	 * 区分 mount 和 update
	 * 如果是 mount 阶段，则不进行副作用标记，而是在根节点进行一次placement插入
	 */
	if (current !== null) {
		// update
		wip.child = reconcileChildFibers(wip, current?.child, children);
	} else {
		// mount
		wip.child = mountChildReconcile(wip, null, children);
	}
};
