import internals from 'shared/internals';
import { Action } from 'shared/ReactTypes';
import { Dispatcher, Dispatch } from 'react/src/currentDispatcher';
import { scheduleUpdateOnFiber } from './workLoop';
import { FiberNode } from './fiber';
import {
	createUpdate,
	createUpdateQueue,
	enqueueUpdate,
	processUpdateQueue,
	UpdateQueue
} from './updateQueue';

let currentRenderingFiber: FiberNode | null = null;
let workInProgressHook: Hook | null = null;
let currentHook: Hook | null = null;

const { currentDispatcher } = internals;

/**
 * 通用的 Hook 类型定义
 * 要满足各种 hook 如 useState useMemo useRef 等
 *
 * 如果做到在 hook 中不能在执行hook 如
 * useEffect(() => {
 * 	useState()
 * })
 * 原理是改变 currentDispatcher 指向
 * 当mount or update时，将 currentDispatcher 指向对应的 hook 实现
 * 可以创建一组 api 如
 * {
 * 	useState: () => { throw new Error('can not use hook in other hook')}
 * }
 * 如果正在执行hook时，修改 currentDispatcher 指向就可以实现了。
 *
 * @interface Hook
 */
interface Hook {
	// 区别于 Fiber 的 memoizedState
	// hook 的 memoizedState 存放的是数据 fc fiber 的 memoizedState 指向的是hook链表
	memoizedState: any;
	updateQueue: unknown;
	next: Hook | null;
}

/**
 * 调用函数组件,并返回子组件
 * @param wip
 */
export const renderWithHooks = (wip: FiberNode) => {
	// 赋值操作
	currentRenderingFiber = wip;
	// 重置 fiber hook 链表，注意区分 fiber 和 hook 的 memoizedState
	wip.memoizedState = null;

	const current = wip.alternate;
	if (current !== null) {
		// update
		currentDispatcher.current = HooksDispatcherOnUpdate;
	} else {
		// mount 将 mount 对应的 hooks 集合赋值给数据共享层
		currentDispatcher.current = HooksDispatcherOnMount;
	}

	const Component = wip.type;
	const props = wip.pendingProps;
	const children = Component(props);

	// 重置操作
	currentRenderingFiber = null;
	workInProgressHook = null;
	currentHook = null;

	return children;
};

const HooksDispatcherOnMount: Dispatcher = {
	useState: mountState
};

const HooksDispatcherOnUpdate: Dispatcher = {
	useState: updateState
};

function updateState<State>(): [State, Dispatch<State>] {
	// 需要实现：
	// 针对update时的dispatcher
	// 实现对标mountWorkInProgresHook的updateWorkInProgresHook
	// 实现updateState中「计算新state的逻辑」
	// 其中updateWorkInProgresHook的实现需要考虑的问题：
	// hook数据从哪来？
	// 交互阶段触发的更新
	const hook = updateWorkInProgressHook();
	const queue = hook.updateQueue as UpdateQueue<State>;
	const pending = queue.shared.pending;

	const { memoizedState } = processUpdateQueue(hook.memoizedState, pending);
	hook.memoizedState = memoizedState;
	console.log('memoizedState', memoizedState);
	return [memoizedState, queue.dispatch as Dispatch<State>];
}

const updateWorkInProgressHook = () => {
	// todo render阶段触发的更新
	let nextCurrentHook: Hook | null;

	if (currentHook === null) {
		// 当前 fc 首个 hook
		const current = currentRenderingFiber?.alternate;
		if (current !== null) {
			nextCurrentHook = current?.memoizedState;
		} else {
			nextCurrentHook = null;
		}
	} else {
		// 当前组件非首个 hook
		nextCurrentHook = currentHook.next;
	}

	if (nextCurrentHook === null) {
		throw new Error(`${currentRenderingFiber?.type} hook 比上次执行时多`);
	}

	currentHook = nextCurrentHook;
	const newHook: Hook = {
		memoizedState: currentHook.memoizedState,
		updateQueue: currentHook.updateQueue,
		next: null
	};
	if (workInProgressHook === null) {
		if (currentRenderingFiber === null) {
			// 非 FC 环境，报错
			throw new Error('请在函数组件内部使用 hook');
		} else {
			// 赋值操作
			// 当前正在执行的hook
			workInProgressHook = newHook;
			// 把创建的 hook 存放到 fiber 链表中
			currentRenderingFiber.memoizedState = workInProgressHook;
		}
	} else {
		workInProgressHook.next = newHook;
		workInProgressHook = newHook;
	}
	return workInProgressHook;
};

function mountState<State>(
	initialState: (() => State) | State
): [State, Dispatch<State>] {
	const hook = mountWorkInProgressHook();

	let memoizedState;
	if (initialState instanceof Function) {
		memoizedState = initialState();
	} else {
		memoizedState = initialState;
	}

	/**
	 * 下一步需要做的事
	 * 将 dispatch 接入现有的 update 流程
	 */
	const queue = createUpdateQueue<State>();
	hook.updateQueue = queue;
	hook.memoizedState = memoizedState;

	/**
	 * 将 fiber updateQueue 进行绑定，用户只需要传入 action
	 * @bind dispatchSetState.bind(null, currentRenderingFiber, queue)
	 */
	// @ts-ignore
	const dispatch = dispatchSetState.bind(null, currentRenderingFiber, queue);
	queue.dispatch = dispatch;

	return [memoizedState, dispatch];
}

function dispatchSetState<State>(
	fiber: FiberNode,
	updateQueue: UpdateQueue<State>,
	action: Action<State>
) {
	const update = createUpdate(action);
	enqueueUpdate(updateQueue, update);
	scheduleUpdateOnFiber(fiber);
}

function mountWorkInProgressHook(): Hook {
	const hook: Hook = {
		memoizedState: null,
		updateQueue: null,
		next: null
	};

	if (workInProgressHook === null) {
		if (currentRenderingFiber === null) {
			// 非 FC 环境，报错
			throw new Error('请在函数组件内部使用 hook');
		} else {
			// 赋值操作
			// 当前正在执行的hook
			workInProgressHook = hook;
			// 把创建的 hook 存放到 fiber 链表中
			currentRenderingFiber.memoizedState = workInProgressHook;
		}
	} else {
		// mount 时，当前组件的非首个 hook
		// 先建立连接，然后只想当前的 hook
		workInProgressHook.next = hook;
		workInProgressHook = hook;
	}

	return hook;
}
