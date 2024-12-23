import logo from './logo.svg';
//import './App.css';
import Contact from './components/Contact';
import './index.css';
import { useEffect, useState } from 'react';
import ToolBar from './components/ToolBar';
import Header from './components/Header';
import { Home } from 'lucide-react';


function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);

  // Get the API URL based on the current hostname
  const getApiUrl = () => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8080';
    }
    // Use the local network IP address of your development machine
    return `http://${window.location.hostname}:8080`;
  };


  useEffect(() => {
    const fetchContacts = async() => {
      try {
        //const resp = await fetch("http://localhost:8080/contacts");
        //const resp = await fetch("https://4604-67-159-204-221.ngrok-free.app/contacts");
        const apiUrl = getApiUrl();
        const resp = await fetch(`${apiUrl}/contacts`);

        if (!resp.ok) {
          throw new Error("Error fetching contacts")
        }
        const data = await resp.json();
        const updatedData = data.map(contact => ({ ...contact, IsSelected: false }));
        console.log("data: ", data)
        setContacts(updatedData);
      } catch (error) {
          setError(error.Message);
      } finally {
          setLoading(false);
      }
    };

    fetchContacts();
  },[]);

  const handleSelectContact = (contactEmail, isSelected) => {
    setContacts((prevContacts) =>
      prevContacts.map((contact) =>
        contact.Email === contactEmail
          ? { ...contact, IsSelected: isSelected }
          : contact
      )
    );
  };

  const handleSearch = (brotherName) => {
    setSearchTerm(brotherName);
    console.log("Searching: " + brotherName);
  };

  const filteredContacts = contacts.filter((brother) => {
    const fullName = (brother.FirstName + " " + brother.LastName).toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const downloadSelected = () => {
    const selectedContacts = contacts.filter((contact) => contact.IsSelected);

    if (selectedContacts.length === 0) {
      console.log("No contacts selected for download.");
      return;
    }
  
    const apiUrl = getApiUrl();
  
    // Prepare email list from selected contacts
    const contactIds = selectedContacts.map((contact) => contact.Email).join(',');
  
    // Initiate download
    window.location.href = `${apiUrl}/download-selected?emails=${encodeURIComponent(contactIds)}`;
  
    console.log("Downloading selected contacts: ", contactIds);
  };
  
  const downloadAll = () => {
    try {
      // Using window.location.href for direct download
      const apiUrl = getApiUrl();
      window.location.href = `${apiUrl}/download-all`;
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="bg-black text-white grid grid-rows-[1fr,auto]">
      <Header />
  
      {/* Show loading, error, or empty states */}
      {loading && <div className="p-4 text-center">Loading contacts...</div>}
      {error && <div className="p-4 text-center text-red-500">Error: {error}</div>}
      {!loading && !error && contacts.length === 0 && (
        <div className="p-4 text-center">No contacts found.</div>
      )}
  
      {/* Render contacts only when available */}
      {!loading && !error && contacts.length > 0 && (
        <div className="w-full p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7 gap-2 place-items-stretch pb-[200px]">
          {filteredContacts.map((brother) => (
            <Contact
              key={brother.Email}
              FirstName={brother.FirstName}
              LastName={brother.LastName}
              PhoneNumber={brother.PhoneNumber}
              Email={brother.Email}
              IsSelected={brother.IsSelected}
              onSelect={(isSelected) => handleSelectContact(brother.Email, isSelected)}
            />
          ))}
        </div>
      )}
  
      <ToolBar
        onSearch={handleSearch}
        buttonText="Add Selected"
        addSelected={() => downloadSelected()}
        addAll={() => downloadAll()}
      />
    </div>
  );
}

export default App;
