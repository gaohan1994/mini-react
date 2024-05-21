import { FiberNode } from 'react-reconciler/src/fiber';
import { HostText } from 'react-reconciler/src/workTag';

export type Container = Element;
export type Instance = Element;
export type TextInstance = Text;

// 创建节点，由宿主环境提供
export const createInstance = (type: string, props: any): Instance => {
	// todo 处理 props
	const element = document.createElement(type);
	return element;
};

export const appendInitialChild = (
	parent: Instance | Container,
	child: Instance
) => {
	parent.appendChild(child);
};

// 创建文本节点
export const createTextInstance = (content: string) => {
	return document.createTextNode(content);
};

export const appendChildToContainer = appendInitialChild;

export const commitUpdate = (fiber: FiberNode) => {
	switch (fiber.tag) {
		case HostText:
			const newContent = fiber.memoizedProps.content;
			return commitTextUpdate(fiber.stateNode, newContent);
		default: {
			if (__DEV__) {
				console.warn('未实现的 commitUpdate 类型');
			}
		}
	}
};

const commitTextUpdate = (textInstance: TextInstance, newContent: string) => {
	textInstance.textContent = newContent;
};

export const removeChild = (
	child: Instance | TextInstance,
	container: Container
) => {
	container.removeChild(child);
};
