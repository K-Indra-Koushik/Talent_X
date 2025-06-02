import React from 'react';
import { Service } from '../types';

interface ServiceCardProps {
  service: Service;
  onServiceSelect?: (serviceId: string) => void; // Optional: For interactive elements
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onServiceSelect }) => {
  return (
    <div className="bg-slate-800 shadow-xl rounded-lg p-6 flex flex-col items-start text-left h-full hover:shadow-sky-500/30 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
      {service.icon && (
        <div className="p-3 bg-sky-600/20 rounded-lg mb-4 text-sky-400">
          {React.cloneElement(service.icon as React.ReactElement<any>, { className: 'w-8 h-8' })}
        </div>
      )}
      <h3 className="text-xl font-semibold text-sky-400 mb-2">{service.title}</h3>
      <p className="text-sm text-gray-300 flex-grow mb-4">{service.description}</p>
      {onServiceSelect && (
         <button 
           onClick={() => onServiceSelect(service.id)}
           className="mt-auto bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 text-sm"
         >
           Try Now
         </button>
      )}
    </div>
  );
};

export default ServiceCard;