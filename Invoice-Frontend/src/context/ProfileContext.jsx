// import React, { createContext, useContext, useEffect, useState } from "react";
// import axios from "../api/axios";

// const ProfileContext = createContext();

// export const useProfile = () => useContext(ProfileContext);

// export const ProfileProvider = ({ children }) => {
//   const [profile, setProfile] = useState(null);

//   useEffect(() => {
//     axios.get("/api/business-profiles/")
//       .then((res) => {
//         if (res.data.length > 0) setProfile(res.data[0]);
//       })
//       .catch((err) => console.error("Profile fetch failed:", err));
//   }, []);

//   return (
//     <ProfileContext.Provider value={{ profile }}>
//       {children}
//     </ProfileContext.Provider>
//   );
// };
