import React from 'react';

function InventorySelector({ inventory, onSelectItem, selectedProductId }) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md h-full flex flex-col">
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Select Item for Analysis</h2>
        <div className="flex-grow overflow-y-auto pr-2">
          {inventory.length > 0 ? (
            inventory.map(item => (
              <div key={item.id} onClick={() => onSelectItem(item.id)}
                className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedProductId === item.id ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'bg-gray-50 hover:bg-indigo-50'}`}>
                <span className="text-3xl mr-4">{item.image}</span>
                <p className="font-semibold text-gray-700">{item.name}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 pt-10">Add items to your inventory to begin analysis.</p>
          )}
        </div>
      </div>
    );
}

export default InventorySelector;
