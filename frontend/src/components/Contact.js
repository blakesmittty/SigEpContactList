
import { Plus, Check } from 'lucide-react'

function Contact({PhoneNumber, FirstName, LastName, Email, onSelect, IsSelected}) {

    const handleClick = () => {
        //onSelect({ PhoneNumber, FirstName, LastName, Email }, true);
        onSelect(!IsSelected); // Toggle the selection
    };

    return (
        <div className={` bg-black rounded-lg transition-colors duration-200 border-solid border-4 p-6 flex items-center justify-between w-full ${
            IsSelected ? "border-green-500" : "border-purple-500"
        }`} 
        onClick={handleClick} >
          <div className="flex-grow">
            <h3 className="text-lg font-semibold text-white">{FirstName + " " + LastName}</h3>
            <p className="text-sm text-white">{Email}</p>
            <p className="text-sm text-white">{PhoneNumber}</p>
          </div>
          <button
            className={`ml-4 p-2 rounded-full transition-colors duration-200 ${
              IsSelected ? 'bg-green-500 hover:bg-green-600' : 'bg-purple-500 hover:bg-purple-600'
            }`}
            aria-label={IsSelected ? "Remove contact" : "Add contact"}
          >
            {IsSelected ? (
              <Check className="h-6 w-6 text-white" />
            ) : (
              <Plus className="h-6 w-6 text-white" />
            )}
          </button>
        </div>
    );

};

export default Contact;