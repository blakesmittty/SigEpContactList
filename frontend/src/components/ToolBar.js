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
                    className="relative text-white font-semibold px-4 py-2 rounded-md flex-1 bg-black"
                >
                    <span className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-500  via-red-500 to-purple-500 animate-gradient-move bg-[length:200%_100%] shadow-[0_0_15px_rgba(236,72,153,0.5)] shadow-pink-500" />
                    <span className="absolute inset-[4px] bg-black rounded-md transition-colors duration-200 hover:bg-purple-600" />
                    <span className="relative">Add All</span>
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
