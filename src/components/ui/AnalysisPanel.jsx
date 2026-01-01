import React from 'react';
import LightbulbIcon from '../icons/LightbulbIcon.jsx';
import SparklesIcon from '../icons/SparklesIcon.jsx';

function AnalysisPanel({ selectedProduct, associatedItems, onGenerateSlogans, onGeneratePromotion, marketingIdeas, weeklyPromotion, isGenerating }) {
    if (!selectedProduct) {
        return (
            <div className="bg-secondary p-6 rounded-xl shadow-md h-full flex items-center justify-center">
                <div className="text-center text-secondary">
                    <LightbulbIcon className="h-12 w-12 mx-auto mb-4 text-secondary"/>
                    <p>Select an item from your inventory</p>
                    <p className="text-sm">to view co-purchase data and generate AI-powered ideas.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-secondary p-6 rounded-xl shadow-md h-full overflow-y-auto">
            <h2 className="text-lg font-bold text-primary mb-2">Analysis for: <span className="text-accent">{selectedProduct.name}</span></h2>
            
            <div className="mb-6">
                <h3 className="text-md font-semibold text-primary mb-3">Top Co-Purchased Items</h3>
                {associatedItems.length > 0 ? (
                    <ul className="space-y-2">
                        {associatedItems.slice(0,3).map(item => (
                          <li key={item.id} className="flex items-center justify-between bg-primary bg-opacity-10 p-3 rounded-lg">
                            <div className="flex items-center"><span className="text-2xl mr-3">{item.image}</span><span className="font-medium text-primary">{item.name}</span></div>
                            <span className="font-bold text-accent text-lg">{item.percentage}%</span>
                          </li>
                        ))}
                    </ul>
                ) : <p className="text-sm text-secondary">No co-purchase data available.</p> }
            </div>
            
            <div className="border-t border-border pt-6 space-y-6">
                 {/* Weekly Promotion Generator */}
                <div>
                    <h3 className="text-md font-semibold text-primary mb-3">Weekly Promotion Plan</h3>
                    <button onClick={onGeneratePromotion} disabled={isGenerating.promotion} className="w-full flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 disabled:bg-opacity-50 bg-green-600 text-white hover:bg-white hover:text-black">
                        {isGenerating.promotion ? 'Generating...' : <><SparklesIcon className="h-5 w-5 mr-2" />Create Promotion Plan</>}
                    </button>
                    {weeklyPromotion && <div className="mt-3 bg-green-900 bg-opacity-20 p-4 rounded-lg text-sm text-green-300 whitespace-pre-wrap">{weeklyPromotion}</div>}
                </div>
                
                {/* Slogan Generator */}
                <div>
                    <h3 className="text-md font-semibold text-primary mb-3">Marketing Slogans</h3>
                    <button onClick={onGenerateSlogans} disabled={isGenerating.slogans} className="w-full flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 disabled:bg-opacity-50 bg-amber-600 text-white hover:bg-white hover:text-black">
                        {isGenerating.slogans ? 'Generating...' : <><SparklesIcon className="h-5 w-5 mr-2"/>Generate Slogans</>}
                    </button>
                    {marketingIdeas && <div className="mt-3 bg-amber-900 bg-opacity-20 p-4 rounded-lg text-sm text-amber-300 whitespace-pre-wrap">{marketingIdeas}</div>}
                </div>
            </div>
        </div>
    );
}

export default AnalysisPanel;
