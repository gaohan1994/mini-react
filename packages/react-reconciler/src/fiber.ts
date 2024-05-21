import { Container } from 'hostConfig';
import { Key, Props, ReactElementType, Ref } from 'shared/ReactTypes';
import { FunctionComponent, HostComponent, WorkTag } from './workTag';
import { Flags, NoFlags } from './fiberFlags';

export class FiberNode {
	public tag: WorkTag;
	public key: Key;
	public ref: Ref;
	public type: any;

	public stateNode: any;

	public return: FiberNode | null;
	public sibling: FiberNode | null;
	public child: FiberNode | null;
	public index: number;

	public pendingProps: Props;
	public memoizedProps: Props | null;
	public memoizedState: any;
	public updateQueue: unknown;

	/**
	 * 指向另一颗树的 fibernode 节点
	 */
	public alternate: FiberNode | null;

	public flags: Flags;
	public subtreeFlags: Flags;
	public deletions: FiberNode[] | null;

	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		this.tag = tag;
		this.key = key;

		// 存放 dom 节点
		this.stateNode = null;

		this.type = null;

		// 构成树结构
		this.return = null;
		this.sibling = null;
		this.child = null;
		this.index = 0;

		this.ref = null;

		// 作为工作单元
		this.pendingProps = pendingProps;
		this.memoizedProps = null;
		this.memoizedState = null;
		this.updateQueue = null;

		this.alternate = null;
		// 副作用
		this.flags = NoFlags;
		this.subtreeFlags = NoFlags;
		this.deletions = [];
	}
}

export class FiberRootNode {
	public container: Container;
	public current: FiberNode;
	public finishedWork: FiberNode | null;

	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container;
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this;
		this.finishedWork = null;
	}
}

export const createWorkInProgress = (
	current: FiberNode,
	pendingProps: Props
) => {
	let wip = current.alternate;

	if (wip === null) {
		// mount
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.stateNode = current.stateNode;
		// 链接
		wip.alternate = current;
		current.alternate = wip;
	} else {
		// update
		wip.pendingProps = pendingProps;
		wip.flags = NoFlags;
		wip.subtreeFlags = NoFlags;
		wip.deletions = null;
	}

	// 公共修改的部分
	wip.type = current.type;
	wip.updateQueue = current.updateQueue;
	wip.child = current.child;
	wip.memoizedState = current.memoizedState;
	wip.memoizedProps = current.memoizedProps;

	return wip;
};

export const createFiberFromElement = (element: ReactElementType) => {
	const { type, props, key } = element;

	let workTag: WorkTag = FunctionComponent;

	if (typeof type === 'string') {
		// <div/> => type = 'div'
		workTag = HostComponent;
	} else if (typeof type !== 'function' && __DEV__) {
		console.warn('未实现的 type 类型', type);
	}

	const fiber = new FiberNode(workTag, props, key);
	fiber.type = type;

	if (__DEV__) {
		console.warn(`created ${workTag} fiber: `, fiber);
	}
	return fiber;
};

// 将传入 fiber 的子节点 and 子节点的兄弟节点的 flag 冒泡到当前节点
export const bubbleProperties = (wip: FiberNode) => {
	let subtreeFlags = NoFlags;
	let child = wip.child;

	while (child !== null) {
		subtreeFlags |= child.subtreeFlags;
		subtreeFlags |= child.flags;

		child.return = wip;
		child = child.sibling;
	}

	wip.subtreeFlags |= subtreeFlags;
};
