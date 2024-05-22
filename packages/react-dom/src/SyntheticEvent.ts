/**
 * 事件合成模块
 *
 * 想要将元素的事件和 react 事件联系起来
 * 需要实现一套合成事件系统
 * 这套系统和宿主环境有关，不侵入 react-reconcile
 *
 * 首先要保存相应的 props 在 dom 上
 */

import { Container } from 'hostConfig';
import { Props } from 'shared/ReactTypes';

const elementPropsKey = '__props__';
const validEventType = ['click'];

type EventCallback = (event: Event) => void;
type Paths = {
	capture: EventCallback[];
	bubble: EventCallback[];
};
interface SyntheticEvent extends Event {
	__stopPropagation: boolean;
}

export interface DOMElement extends Element {
	[elementPropsKey]: Props;
}

/**
 * 更新 fiber 节点的 props 到对应的 dom 上
 */
export const updateFiberProps = (dom: DOMElement, props: Props): void => {
	dom[elementPropsKey] = props;
};

/**
 * 初始化 container 对应的事件
 * @param container
 * @param eventType
 * @param e
 */
export const initEvent = (container: Container, eventType: string) => {
	if (!validEventType.includes(eventType)) {
		if (__DEV__) {
			console.warn(`不支持的 event type${eventType}`);
		}
		return;
	}

	container.addEventListener(eventType, (event) => {
		dispatchEvent(container, eventType, event);
	});
};

/**
 * 触发事件
 */
const dispatchEvent = (
	container: Container,
	eventType: string,
	event: Event
) => {
	const targetElement = event.target;
	if (targetElement === null) {
		console.warn(`没有 target element 的事件`, event);
	}

	// * 1. 收集沿途的事件
	const { capture, bubble } = collectPaths(
		targetElement as DOMElement,
		container,
		eventType
	);
	// * 2. 构成合成事件
	const se = createSyntheticEvent(event);
	// * 3. 遍历 capture
	triggerEventFlow(capture, se);
	// * 4. 遍历 bubble

	if (!se.__stopPropagation) {
		triggerEventFlow(bubble, se);
	}
};

function triggerEventFlow(callbacks: EventCallback[], se: SyntheticEvent) {
	for (let index = 0; index < callbacks.length; index++) {
		const callback = callbacks[index];
		callback.call(null, se);

		if (se.__stopPropagation) {
			break;
		}
	}
}

const createSyntheticEvent = (event: Event): SyntheticEvent => {
	const syntheticEvent = event as SyntheticEvent;
	syntheticEvent.__stopPropagation = false;
	const originStopPropagation = event.stopPropagation;

	syntheticEvent.stopPropagation = () => {
		syntheticEvent.__stopPropagation = true;
		if (originStopPropagation) {
			originStopPropagation();
		}
	};

	return syntheticEvent;
};

const getEventCallbackNameFromEventType = (
	eventType: string
): string[] | undefined => {
	return {
		click: ['onClickCapture', 'onClick']
	}[eventType];
};

const collectPaths = (
	targetElement: DOMElement,
	container: Container,
	eventType: string
): Paths => {
	const paths: Paths = {
		capture: [],
		bubble: []
	};

	while (targetElement && targetElement !== container) {
		// 收集事件
		// 拿到当前 dom 的 props 属性
		const elementProps = targetElement[elementPropsKey];
		if (elementProps) {
			const callbackNameList = getEventCallbackNameFromEventType(eventType);
			callbackNameList?.forEach((callbackName, index) => {
				const callback = elementProps[callbackName];
				// 考虑这样的结构
				// <div onClick onClickCapture>
				// 	<div onClick onClickCapture>
				// 	 <p onClick>
				if (callback) {
					if (index === 0) {
						// capture
						paths.capture.unshift(callback);
					} else {
						// bubble
						paths.capture.push(callback);
					}
				}
			});
		}

		// 继续遍历
		targetElement = targetElement.parentNode as DOMElement;
	}

	return paths;
};
