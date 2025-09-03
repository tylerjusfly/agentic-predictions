"use client";

import { useState } from "react";
import { changePassword } from "./actions";
import { Button } from "@/components/ui/button";
import moment from "moment";
import { useGetUser } from "@/hooks/useGetUser";
import { Input } from "../ui/input";

export default function PasswordChange() {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [startUpdate, setStartUpdate] = useState(false);
  const [message, setMessage] = useState("");
  const user = useGetUser();

  const subscribed = user?.subscribed === 1;
  const isVerified = false;

  const registrationDate = moment(user?.subsribed_at || "");
  const expirationDate = registrationDate.clone().add(1, "month").startOf("month");
  const subscriptionExpires = expirationDate.format("YYYY-MM-DD HH:mm:ss");

  const handleCancel = () => {
    setStartUpdate(false);
    setMessage("");
    setNewPassword("");
  };

  const handleChange = async () => {
    if (!newPassword) {
      setMessage("Password cannot be empty");
      return;
    }
    try {
      setLoading(true);
      setMessage("");
      if (!user?.id) {
        setMessage("User not found");
        return;
      }
      const result = await changePassword(user?.id, newPassword);
      setMessage(result.success ? "Password updated successfully!" : result.error || "Something went wrong");
    } catch {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
      setStartUpdate(false);
    //   handleCancel();
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">Email</p>
          <p className="font-medium">{user?.email}</p>
        </div>
        <Button disabled className="px-3 py-1 text-sm bg-red-500 text-white rounded-md">
          {isVerified ? "Verified" : "Unverified"}
        </Button>
      </div>

      {startUpdate ? (
        <div className="flex justify-between items-center gap-4">
          <Input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={handleChange} variant="success" className="px-3 py-1 text-sm text-white rounded-md hover:bg-red-600">
              {/* Update */}
              {loading ? "Updating..." : "Update"}
            </Button>
            <Button
              onClick={handleCancel}
              variant="destructive"
              className="px-3 py-1 text-sm text-white rounded-md hover:bg-red-600"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Password</p>
            <p className="font-medium">••••••••</p>
          </div>
          <Button
            onClick={() => setStartUpdate(true)}
            variant="ghost"
            className="px-3 py-1 text-sm text-white rounded-md hover:bg-red-600"
          >
            Update
          </Button>
        </div>
      )}
      {message && <p className="text-xs text-gray-500 mt-1">{message}</p>}

      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">Subscription</p>
          <p className="font-medium">{subscriptionExpires === "Invalid date" ? "Free Tier" : subscriptionExpires}</p>
        </div>
        <Button variant="ghost" className="px-3 py-1 text-sm text-white rounded-md">
          {subscribed ? "Subscribed" : "Subscribe"}
        </Button>
      </div>
    </div>
  );
}