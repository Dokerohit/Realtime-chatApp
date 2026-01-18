import axios from "axios";

export const axiosInstance=axios.create({
    baseURL:import.meta.env.MODE==="development" ? "http://localhost:5001/api":"/api",  //for fetching api use axios
    withCredentials:true,    // to send cookies with every single req.
})