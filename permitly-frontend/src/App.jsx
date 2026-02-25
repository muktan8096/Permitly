import { BrowserRouter, Routes, Route } from "react-router-dom";
import ActivateAccount from "./pages/ActivateAccount";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";

import DashboardLayout from "./layout/DashboardLayout";
import Home from "./pages/dashboard/Home";
import LeaveRequest from "./pages/dashboard/LeaveRequest";
import Attendance from "./pages/dashboard/Attendance";
import Career from "./pages/dashboard/Career";
import Profile from "./pages/dashboard/Profile";
import Settings from "./pages/dashboard/Settings";
import TeacherSelectPersona from "./pages/TeacherSelectPersona";
import TeacherDashboard from "./pages/dashboard/TeacherDashboard";
import TeacherHistory from "./pages/dashboard/TeacherHistory";
import Notifications from "./pages/Notifications";
import TeacherLayout from "./layout/TeacherLayout";




export default function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public pages */}
                <Route path="/" element={<ActivateAccount />} />
                <Route path="/login" element={<Login />} />
                <Route path="/change-password" element={<ChangePassword />} />

                {/* Teacher persona selection (standalone) */}
                {/* Teacher persona selection (standalone) */}
                <Route path="/teacher/select-persona" element={<TeacherSelectPersona />} />

                {/* Teacher dashboard (nested like student) */}
                <Route path="/teacher" element={<TeacherLayout />}>
                    <Route path="dashboard" element={<TeacherDashboard />} />
                    <Route path="history" element={<TeacherHistory />} />
                    <Route path="settings" element={<div>Settings (coming soon)</div>} />
                </Route>


                {/* Dashboard (nested student dashboard) */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<Home />} />
                    <Route path="leave-request" element={<LeaveRequest />} />
                    <Route path="attendance" element={<Attendance />} />
                    <Route path="career" element={<Career />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="notifications" element={<Notifications />} />

                </Route>

            </Routes>
        </BrowserRouter>
    );
}
