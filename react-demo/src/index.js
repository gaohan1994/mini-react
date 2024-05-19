import React from 'react';
import ReactDOM from 'react-dom';
const root = document.querySelector('#root');

function App() {
	return (
		<div>
			<Child />
		</div>
	);
}

const Child = () => {
	return <span>Gao!</span>;
};

ReactDOM.createRoot(root).render(<App />);
