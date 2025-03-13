import React from 'react';
import Lottie from 'lottie-react';
import successAnimation from '../../app/animations/success.json';
import failureAnimation from '../../app/animations/failure.json';

interface TransactionResultProps {
  success: boolean;
  message: string;
  details: string;
  onClose: () => void;
}

const TransactionResult: React.FC<TransactionResultProps> = ({ success, message, details, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg mx-auto transform transition-all ease-in-out duration-300">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <span className="sr-only">Close</span>
            &times;
          </button>
        </div>
        <div className="text-center">
          <Lottie
            animationData={success ? successAnimation : failureAnimation}
            autoplay={true}
            loop={false}
            className="w-48 h-48 mx-auto"
          />
          <h2 className="text-2xl font-bold mt-4 text-gray-800">{message}</h2>
          <p className="text-gray-600 mt-2">{details}</p>
          <button onClick={onClose} className="mt-6 bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionResult;
