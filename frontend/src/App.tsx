import Header from "./components/shared/Header";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import { useAuth } from "./context/context";

import styles from "./App.module.css";

import { Navigate } from "react-router-dom";

function App() {
	const auth = useAuth();

	return (
		<div>
			<Header />
			<main className={styles.routes}>
				<Routes>
					<Route path='/' element={<Home />} />
					<Route path='/login' element={<Login />} />
					<Route path='/signup' element={<Signup />} />
					{/* Protected Route */}
					<Route
						path='/chat'
						element={
							auth?.isLoggedIn ? <Chat /> : <Navigate to='/login' replace />
						}
					/>
				</Routes>
			</main>
		</div>
	);
}


export default App;
