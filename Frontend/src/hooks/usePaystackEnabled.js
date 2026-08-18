// hooks/usePaystackEnabled.js
import { useState, useEffect } from "react";
import api from "../services/api";

export function usePaystackEnabled() {
    const [paystackEnabled, setPaystackEnabled] = useState(false);

    useEffect(() => {
        api.get("/config")
            .then((res) => setPaystackEnabled(!!res.data?.paystack_enabled))
            .catch(() => setPaystackEnabled(false));
    }, []);

    return paystackEnabled;
}
