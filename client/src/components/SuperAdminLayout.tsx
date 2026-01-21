import React from 'react';
import { Outlet } from 'react-router-dom';
import SuperAdminSidebar from './SuperAdminSidebar';

export default function SuperAdminLayout() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <SuperAdminSidebar />
            <main className="flex-1 ml-64">
                <Outlet />
            </main>
        </div>
    );
}
