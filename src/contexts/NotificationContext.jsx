import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getNotifications,
  getUnreadCount,
  markAsRead as markAsReadApi,
  markAllAsRead as markAllAsReadApi,
  deleteNotification as deleteNotificationApi,
} from "../services/notificationService";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const response = await getNotifications();
      setNotifications(response.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await getUnreadCount();
      setUnreadCount(response.data?.count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await markAsReadApi(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllAsReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await deleteNotificationApi(notificationId);
      const notification = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const refreshNotifications = useCallback(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Fetch notifications on mount and when token changes
  useEffect(() => {
    refreshNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshNotifications, fetchUnreadCount]);

  // Listen for storage events (login/logout)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        refreshNotifications();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [refreshNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
