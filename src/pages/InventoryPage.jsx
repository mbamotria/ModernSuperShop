import React from 'react';
import { BoxesIcon, Trash2Icon, PlusIcon, MinusIcon } from '../components/icons/index.jsx';

function InventoryPage({ inventory, onRemove, onIncrease, onDecrease }) {
    if (inventory.length === 0) {
        return (
             <div className="text-center text-secondary py-12">
                 <BoxesIcon className="w-12 h-12 text-muted mb-4 mx-auto"/>
                 <p className="font-medium text-primary">Your shop is empty.</p>
                 <p className="text-sm text-secondary">Visit the Marketplace to add items.</p>
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {inventory.map(item => (
                 <div key={item.product.id} className="minimal-card p-5 flex flex-col text-center items-center relative">
                    <button onClick={() => onRemove(item.product.id)} className="absolute top-3 right-3 p-2 text-muted hover:text-danger hover:bg-red-50 rounded-lg transition-colors focus-ring hover-text-black">
                        <Trash2Icon className="h-4 w-4" />
                    </button>
                    <span className="text-6xl mb-4">{item.product.image}</span>
                    <h3 className="font-semibold text-lg text-primary flex-grow">{item.product.name}</h3>
                    <p className="text-secondary my-4 text-lg font-medium">${item.product.price.toFixed(2)}</p>
                     <div className="flex items-center justify-center space-x-3 mt-auto">
                        <button onClick={() => onDecrease(item.product.id)} className="quantity-control-btn p-2 rounded-lg focus-ring hover-text-black">
                            <MinusIcon className="h-4 w-4" />
                        </button>
                        <div className="quantity-badge">{item.quantity}</div>
                        <button onClick={() => onIncrease(item.product.id)} className="quantity-control-btn p-2 rounded-lg focus-ring hover-text-black">
                            <PlusIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default InventoryPage;