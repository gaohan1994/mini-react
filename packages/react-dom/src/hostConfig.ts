export type Container = Element;
export type Instance = Element;

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
