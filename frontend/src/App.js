import logo from './logo.svg';
//import './App.css';
import Contact from './components/Contact';
import './index.css';
import { useEffect, useState } from 'react';
import ToolBar from './components/ToolBar';
import Header from './components/Header';
import JSZip from 'jszip';


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

  const handleSelectContact = (contact, isSelected) => {
    if (isSelected) {
      // Add contact to selected list
      setSelectedContacts((prevSelected) => [...prevSelected, contact]);
    } else {
      // Remove contact from selected list
      setSelectedContacts((prevSelected) =>
        prevSelected.filter((brother) => brother.email !== contact.email) 
      );
    }
  };

  const filteredContacts = contacts.filter(brother => {
    const fullName = (brother.FirstName + " " + brother.LastName).toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });


  const createVcfContent = (contacts) => {
    return contacts.map(contact => {
      // Add proper line endings and remove extra spaces
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${contact.FirstName} ${contact.LastName}`,
        `TEL;TYPE=CELL:${contact.PhoneNumber}`,
        `EMAIL:${contact.Email}`,
        'END:VCARD'
      ].join('\r\n');  // Use proper line endings for VCF
    }).join('\r\n');
  };

  // const createVcfContent = (contacts) => {
  //   return contacts.map(contact => {
  //     // Remove any special characters or spaces from phone number
  //     const cleanPhone = contact.PhoneNumber.replace(/[^0-9+]/g, '');
      
  //     return [
  //       'BEGIN:VCARD',
  //       'VERSION:3.0',
  //       `N:${contact.LastName};${contact.FirstName};;;`,
  //       `FN:${contact.FirstName} ${contact.LastName}`,
  //       `TEL;type=CELL:${cleanPhone}`,
  //       `EMAIL;type=INTERNET:${contact.Email}`,
  //       'END:VCARD'
  //     ].join('\r\n');
  //   }).join('\r\n\r\n');
  // };

  const downloadSelected = () => {
    if (selectedContacts.length === 0) {
      return;
    }

    const apiUrl = getApiUrl();

    const contactIds = selectedContacts.map((contact) => contact.Email).join(',');
    window.location.href = `${apiUrl}/download-selected?emails=${encodeURIComponent(contactIds)}`;
    console.log("contact ids: ", contactIds)

    

    // const vcfContent = createVcfContent(selectedContacts);
    // handleVcfDownload(vcfContent, 'selected-contacts.vcf');
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

  // const saveToFileSystem = async (content, filename) => {
  //   try {
  //     // Add UTF-8 BOM to help with encoding
  //     const utf8BOM = '\uFEFF';
  //     const blob = new Blob([utf8BOM + content], { 
  //       type: 'text/vcard;charset=utf-8' 
  //     });
  
  //     // Check if the File System Access API is available
  //     if ('showSaveFilePicker' in window) {
  //       try {
  //         const handle = await window.showSaveFilePicker({
  //           suggestedName: filename,
  //           types: [{
  //             description: 'VCard File',
  //             accept: {
  //               'text/vcard': ['.vcf'],
  //             },
  //           }],
  //         });
          
  //         const writable = await handle.createWritable();
  //         await writable.write(blob);
  //         await writable.close();
  //         return true;
  //       } catch (err) {
  //         // User cancelled or API failed, fall back to traditional download
  //         console.log('File System API failed, falling back to traditional download');
  //         return false;
  //       }
  //     }
  //     return false;
  //   } catch (err) {
  //     console.error('Error saving to file system:', err);
  //     return false;
  //   }
  // };
  
  const handleVcfDownload = async (content, filename) => {
    // const savedToFileSystem = await saveToFileSystem(content, filename);
    // if (savedToFileSystem) return;

    // const blob = new Blob([content], { type: 'text/vcard' });
    
    // // Check if device is iOS
    // const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    // if (isIos) {
    //   // For iOS devices, open in new window/tab
    //   const reader = new FileReader();
    //   reader.onloadend = function() {
    //     window.location.href = reader.result;
    //   };
    //   reader.readAsDataURL(blob);
    // } else {
    //   // For other devices, try download
    //   try {
    //     // Create object URL
    //     const url = window.URL.createObjectURL(blob);
        
    //     // Create invisible link and click it
    //     const link = document.createElement('a');
    //     link.style.display = 'none';
    //     link.href = url;
    //     link.download = filename;
    //     document.body.appendChild(link);
    //     link.click();
        
    //     // Clean up
    //     setTimeout(() => {
    //       document.body.removeChild(link);
    //       window.URL.revokeObjectURL(url);
    //     }, 100);
    //   } catch (error) {
    //     console.error('Download failed:', error);
    //     // Fallback: open in new tab
    //     window.open(URL.createObjectURL(blob));
    //   }
    // }
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
          {filteredContacts.map((brother, index) => (
            <Contact
              key={index}
              FirstName={brother.FirstName}
              LastName={brother.LastName}
              PhoneNumber={brother.PhoneNumber}
              Email={brother.Email}
              onSelect={handleSelectContact}
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
  
  
  // return (
  //   <div className="bg-black text-white grid grid-rows-[1fr,auto] ">
  //     <Header></Header>
  //     {/* Content Placeholder */}
  //     <div className="w-full p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7 gap-2 place-items-stretch pb-[200px]">
  //       {
  //         filteredContacts.map((brother, index) => (
  //           <Contact
  //           key={index}
  //           name={brother.FirstName + " " + brother.LastName}
  //           phoneNumber={brother.PhoneNumber}
  //           email={brother.Email}
  //           onSelect={handleSelectContact}
  //           />
  //         ))
  //       }
  //     </div>

  //     {/* Toolbar */}
  //     <ToolBar
  //       onSearch={handleSearch}
  //       buttonText="Add Selected"
  //       addSelected={() => downloadSelected()}
  //       addAll={() => downloadAll()}
  //     />
  //   </div>
  // );

}

export default App;
