import React from "react";

function ToolBar({ onSearch, addSelected, addAll}) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-black p-4 flex flex-col space-y-4 border-solid border-t-4 border-red-500">
            {/* Action Buttons */}
            <div className="flex justify-between space-x-4 w-full">
                <button
                    onClick={addSelected}
                    className="transition-colors duration-200 bg-black hover:bg-purple-600 text-white font-semibold px-4 py-2 rounded-md flex-1 border-solid border-4 border-red-500"
                >
                    Add Selected
                </button>
                <button
                    onClick={addAll}
                    className="transition-colors duration-200 bg-black hover:bg-purple-600 text-white font-semibold px-4 py-2 rounded-md flex-1 border-solid border-4 border-red-500"
                >
                    Add All
                </button>
            </div>

            {/* Search Input */}
            <input
                type="text"
                placeholder="Find a brother..."
                className="w-full text-white p-2 rounded-md border border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 bg-black"
                onChange={(e) => onSearch(e.target.value)}
            />
        </div>
    );
}

export default ToolBar;
