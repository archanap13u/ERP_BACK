import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RootPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        if (role === 'HR') {
            navigate('/hr');
        } else if (role === 'OrganizationAdmin') {
            navigate('/organization-dashboard');
        } else if (role === 'Operations') {
            navigate('/ops-dashboard');
        } else if (role === 'Employee') {
            navigate('/employee-dashboard');
        } else if (role === 'Student') {
            navigate('/student-dashboard');
        } else {
            navigate('/login');
        }
    }, [navigate]);

    return (
        <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="italic text-gray-400 font-bold uppercase tracking-widest text-[11px]">Initializing Workspace...</p>
        </div>
    );
}
