import React from 'react';

function StatCard({ title, value, icon, subValue }) {
    return (
        <div className="bg-secondary p-6 rounded-xl shadow-md flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-secondary">{title}</p>
                <p className="text-2xl font-bold text-primary">{value}</p>
                {subValue && <p className="text-sm text-secondary">{subValue}</p>}
            </div>
            <div className="bg-primary bg-opacity-10 p-3 rounded-full">{icon}</div>
        </div>
    );
}

export default StatCard;
