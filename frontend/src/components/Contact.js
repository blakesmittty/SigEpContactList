import React, { useState } from "react";
import { Plus, Check } from 'lucide-react'

function Contact({phoneNumber, name, email}) {

    const [isAdded, setIsAdded] = useState(false);

    const handleClick = () => {
        setIsAdded(!isAdded);
    };

    return (
        <div className={` bg-black rounded-lg transition-colors duration-200 border-solid border-4 p-6 flex items-center justify-between w-full ${
            isAdded ? "border-green-500" : "border-purple-500"
        }`} 
        onClick={handleClick} >
          <div className="flex-grow">
            <h3 className="text-lg font-semibold text-white">{name}</h3>
            <p className="text-sm text-white">{email}</p>
            <p className="text-sm text-white">{phoneNumber}</p>
          </div>
          <button
            className={`ml-4 p-2 rounded-full transition-colors duration-200 ${
              isAdded ? 'bg-green-500 hover:bg-green-600' : 'bg-purple-500 hover:bg-purple-600'
            }`}
            aria-label={isAdded ? "Remove contact" : "Add contact"}
          >
            {isAdded ? (
              <Check className="h-6 w-6 text-white" />
            ) : (
              <Plus className="h-6 w-6 text-white" />
            )}
          </button>
        </div>
    );

};

export default Contact;