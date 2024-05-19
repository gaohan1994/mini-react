import React from 'react';
import ReactDOM from 'react-dom';

const jsx = (
	<div>
		<span>Gao!</span>
	</div>
);

const root = document.querySelector('#root');
ReactDOM.createRoot(root).render(jsx);
