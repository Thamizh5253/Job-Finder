import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const UsernameContext = createContext();

export const UsernameProvider = ({ children }) => {
  axios.defaults.withCredentials = true;

  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState('Guest');
  const [role, setRole] = useState('');
  const [name, setName] = useState('');

  const [auth, setAuth] = useState(false);

  useEffect(() => {
    axios
      .get('http://localhost:5001')
      .then((res) => {
        if (res.data.Status === 'Success') {
          setAuth(true);
          
          setUsername(res.data.name);
          // console.log(res.data.role);
          setRole(res.data.role);
        } else {
          setAuth(false);
        }
      })
      .then((err) => console.log(err));
  }, [auth]);

  return (
    <UsernameContext.Provider value={{ auth, setAuth, username, setUsername, profile, setProfile, role, setRole , name , setName }}>
      {children}
    </UsernameContext.Provider>
  );
};

export default UsernameContext;
