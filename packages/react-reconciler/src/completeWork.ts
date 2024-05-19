import {
	appendInitialChild,
	Container,
	createInstance,
	createTextInstance
} from 'hostConfig';
import { bubbleProperties, FiberNode } from './fiber';
import { HostComponent, HostRoot, HostText } from './workTag';

// 构建一颗离屏的 DOM 树
export const completeWork = (wip: FiberNode) => {
	const newProps = wip.pendingProps;
	const current = wip.alternate;

	switch (wip.tag) {
		case HostComponent:
			if (__DEV__) {
				console.warn('start complete host component component', wip);
			}
			if (current !== null && wip.stateNode) {
				// update
			} else {
				// mount
				// 1. 构建DOM节点
				const instance = createInstance(wip.type, newProps);
				// 2. 将DOM节点插入到离屏DOM树中
				appendAllChildren(instance, wip);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return;

		case HostText:
			if (__DEV__) {
				console.warn('start complete host text component', wip);
			}
			if (current !== null && wip.stateNode) {
				// update
			} else {
				// mount
				const instance = createTextInstance(newProps.content);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return;

		case HostRoot:
			bubbleProperties(wip);
			return;

		default:
			if (__DEV__) {
				console.warn('未实现的 complete tag 类型');
			}
			return;
	}
};

const appendAllChildren = (parent: Container, wip: FiberNode) => {
	let node = wip.child;

	// 进行递归
	while (node !== null) {
		if (node.tag === HostComponent || node.tag === HostText) {
			// 如果是 div or 文本节点
			appendInitialChild(parent, node?.stateNode);
		} else if (node.child !== null) {
			// 如果子节点还有子节点
			// 则继续遍历子节点
			node.child.return = node;
			node = node.child;
			continue;
		}

		if (node === wip) {
			// 如果回到了原点，递归结束了 return
			return;
		}

		// 向上递归，找到有 sibling 的节点
		while (node.sibling === null) {
			if (node.return === null || node.return === wip) {
				return;
			}
			node = node?.return;
		}

		node.sibling.return = node;
		node = node.sibling;
	}
};
