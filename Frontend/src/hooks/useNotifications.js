// hooks/useNotifications.js
import { useState, useEffect } from "react";
import api from "../services/api";

export function useNotifications(userRole) {
    const [notifications, setNotifications] = useState({});

    useEffect(() => {
        if (!userRole) return;

        const fetch = () => {
            api.get("/notifications/summary")
                .then((res) => setNotifications(res.data))
                .catch(() => {});
        };

        fetch();

        const interval = setInterval(fetch, 30000);

        return () => clearInterval(interval);
    }, [userRole]);

    const clearNotification = (key) => {
        setNotifications((prev) => ({ ...prev, [key]: false }));
        // Persist so the next 30s poll doesn't re-light a dot the user just
        // acknowledged — previously this was purely cosmetic client state.
        api.post("/notifications/seen", { section_key: key }).catch(() => {});
    };

    return { notifications, clearNotification };
}