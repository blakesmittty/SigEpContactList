import logo from './logo.svg';
//import './App.css';
import Contact from './components/Contact';
import './index.css';
import { useEffect, useState } from 'react';
import ToolBar from './components/ToolBar';
import Header from './components/Header';

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContacts = async() => {
      try {
        const resp = await fetch("http://localhost:8080/contacts");
        if (!resp.ok) {
          throw new Error("Error fetching contacts")
        }
        const data = await resp.json();
        console.log("data: ", data)
        setContacts(data);
      } catch (error) {
          setError(error.Message);
      } finally {
          setLoading(false);
      }
    };

    fetchContacts();
  },[]);

  const handleSearch = (brotherName) => {
    setSearchTerm(brotherName);
    console.log("Searching: " + brotherName);
  };

  const handleAddAll = () => {

  };

  return (
    <div className="bg-black text-white grid grid-rows-[1fr,auto] ">
      <Header></Header>
      {/* Content Placeholder */}
      <div className="w-full p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7 gap-2 place-items-stretch pb-[200px]">
        {
          contacts.map((brother, index) => (
            <Contact
            key={index}
            name={brother.FirstName + " " + brother.LastName}
            phoneNumber={brother.PhoneNumber}
            email={brother.Email}
            />
          ))
        }
      </div>

      {/* Toolbar */}
      <ToolBar
        onSearch={handleSearch}
        buttonText="Add Selected"
        onButtonClick={handleAddAll}
      />
    </div>
  );

}

export default App;
