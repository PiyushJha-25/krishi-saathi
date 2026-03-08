import { Outlet } from 'react-router-dom';
import TopAppBar from './TopAppBar';
import BottomNavBar from './BottomNavBar';

export default function Layout() {
    return (
        <div className="layout" style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            position: 'relative'
        }}>
            <TopAppBar />
            <main className="main-container" style={{
                flex: 1,
                paddingTop: '64px', /* top bar height */
                paddingBottom: '80px', /* bottom nav height */
                overflowY: 'auto'
            }}>
                <Outlet />
            </main>
            <BottomNavBar />
        </div>
    );
}
