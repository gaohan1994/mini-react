import { Action } from 'shared/ReactTypes';

export interface Update<State> {
	action: Action<State>;
}

export interface UpdateQueue<State> {
	shared: {
		pendding: Update<State> | null;
	};
}

export const createUpdate = <State>(action: Action<State>) => {
	return {
		action
	};
};

export const createUpdateQueue = <State>(): UpdateQueue<State> => {
	return {
		shared: {
			pendding: null
		}
	};
};

export const enqueueUpdate = <State>(
	updateQueue: UpdateQueue<State>,
	update: Update<State>
) => {
	updateQueue.shared.pendding = update;
};

export const processUpdateQueue = <State>(
	baseState: State,
	penddingUpdate: Update<State> | null
): { memoizedState: State } => {
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memoizedState: baseState
	};

	if (penddingUpdate !== null) {
		const action = penddingUpdate.action;
		if (action instanceof Function) {
			// baseState 1 update(x => 4x) => memoizedState 4
			result.memoizedState = action(baseState);
		} else {
			// baseState 1 update 2 => memoizedState 2
			result.memoizedState = action;
		}
	}

	return result;
};
