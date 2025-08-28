// // src/api/axios.js
// import axios from "axios";

// const axiosInstance = axios.create({
//   baseURL: "http://127.0.0.1:8000/", 
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// axiosInstance.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Token ${token}`;
//   }
//   return config;
// });

// export default axiosInstance;






import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/", // or your actual backend URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
    console.log("Sending token in request:", token);
  }
  return config;
});

export default api;






