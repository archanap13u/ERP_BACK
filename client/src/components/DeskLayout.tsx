import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import DeskSidebar from './DeskSidebar';
import DeskNavbar from './DeskNavbar';

export default function DeskLayout() {
    const navigate = useNavigate();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        if (!role) {
            navigate('/login');
        } else {
            setAuthorized(true);
        }
    }, [navigate]);

    if (!authorized) {
        return <div className="h-screen bg-[#f4f5f6] flex items-center justify-center italic text-gray-500">Checking access...</div>;
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <DeskNavbar />
            <div className="flex flex-1 pt-11">
                <DeskSidebar />
                <main className="flex-1 ml-60 overflow-y-auto px-12 py-8 bg-[#f4f5f6]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
