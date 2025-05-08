import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { authApi } from "@/utils/api";
import { User, UserStats } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  User as UserIcon,
  Mail,
  Key,
  ShieldCheck,
} from "lucide-react";

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [stats, setStats] = useState<UserStats | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authApi.getCurrentUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }

    setUser(currentUser);
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    const fetchUserStats = async () => {
      setIsLoading(true);
      try {
        const response = await authApi.getUserStats();
        if (response?.data) {
          setStats(response.data);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUserStats();
    }
  }, [user]);
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setIsUpdating(true);

    try {
      const success = await authApi.changePassword(
        password,
        newPassword,
        confirmPassword
      );
      if (success) {
        // Reset form
        setPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 text-library-DEFAULT animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null; // Redirect handled in useEffect
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-library-DEFAULT">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-full bg-library-DEFAULT/10 flex items-center justify-center">
                  <UserIcon className="h-12 w-12 text-library-DEFAULT" />
                </div>
              </div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.role}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p>{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <ShieldCheck className="h-5 w-5 mr-3 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Account Type</p>
                    <p className="capitalize">{user.role}</p>
                  </div>
                </div>
                <div className="pt-2">
                  <Button
                    onClick={() => {
                      authApi.logout();
                      navigate("/");
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {passwordError && (
                    <p className="text-sm text-red-500">{passwordError}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={
                    isUpdating || !password || !newPassword || !confirmPassword
                  }
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Account Activity</CardTitle>
              <CardDescription>Your recent activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-500">Active Loans</p>
                  <p className="font-semibold text-xl">
                    {stats?.totalActiveLoan || 0}
                  </p>
                </div>
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-500">Books Returned</p>
                  <p className="font-semibold text-xl">
                    {stats?.totalReturnedLoan || 0}
                  </p>
                </div>
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-500">Pending Requests</p>
                  <p className="font-semibold text-xl">
                    {stats?.totalPendingLoan || 0}
                  </p>
                </div>
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-500">Overdue Books</p>
                  <p className="font-semibold text-xl text-red-500">
                    {stats?.totalOverDueLoan || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reviews Written</p>
                  <p className="font-semibold text-xl">
                    {stats?.totalReviewWritten || 0}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Button variant="outline" className="w-full" asChild>
                  <a href="/loans">View Loan History</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
