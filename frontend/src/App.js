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
        
      } catch (error) {
          setError(error.Message);
      } finally {

      }
    };
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
        <Contact name={"blake"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
        <Contact name={"blake"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
        <Contact name={"blake"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
        <Contact name={"blake"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
        <Contact name={"blake"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
        <Contact name={"blake"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
        <Contact name={"blake"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
        <Contact name={"abdallah hinawwi"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
        <Contact name={"blake"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
        <Contact name={"blake"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
        <Contact name={"blake"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
        <Contact name={"blake"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
        <Contact name={"blake"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
        <Contact name={"blake"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
        <Contact name={"blake"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
        <Contact name={"blake"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
        <Contact name={"blake"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
        <Contact name={"blake"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
        <Contact name={"blake"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
        <Contact name={"blake"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
        <Contact name={"blake"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
        <Contact name={"blake"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
        <Contact name={"blake"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
        <Contact name={"blake"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
        <Contact name={"blake"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
        <Contact name={"blake"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
        <Contact name={"blake"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
        <Contact name={"blake"} phoneNumber={"5555555555"} email={"blakeas12@gmail.com"} />
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
