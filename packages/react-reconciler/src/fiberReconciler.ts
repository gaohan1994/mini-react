import { Container } from 'hostConfig';
import { FiberNode, FiberRootNode } from './fiber';
import { HostRoot } from './workTag';
import {
	UpdateQueue,
	createUpdate,
	createUpdateQueue,
	enqueueUpdate
} from './updateQueue';
import { ReactElementType } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './workLoop';

/**
 * 创建根节点
 * api 的调用时机是 ReactDOM.createRoot
 * @param container
 * @returns
 */
export const createContainer = (container: Container) => {
	const hostRootFiber = new FiberNode(HostRoot, {}, null);
	const root = new FiberRootNode(container, hostRootFiber);
	hostRootFiber.updateQueue = createUpdateQueue();
	return root;
};

/**
 * 更新根节点
 * 将首屏渲染和我们实现的更新机制链接起来
 * api调用时机是 ReactDOM.createRoot(xx).render() 中的 render
 * @param element
 * @param root
 * @returns
 */
export const updateContainer = (
	element: ReactElementType,
	root: FiberRootNode
) => {
	const hostRootFiber = root.current;
	const update = createUpdate<ReactElementType | null>(element);
	enqueueUpdate(
		hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>,
		update
	);
	scheduleUpdateOnFiber(hostRootFiber);
	return element;
};
