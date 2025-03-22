import React from "react";
interface ErrorModalProps{
    message:string,
    isOpen:boolean,
    onClose:()=>void
}
const ErrorModal:React.FC<ErrorModalProps> =({
    message,
    isOpen,
    onClose
}) =>{
    if(!isOpen) return null   
return(
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-96 z-50">
    <div className="bg-yellow-300 text-yellow-800 border border-yellow-600 rounded-lg shadow-lg flex items-center justify-between p-4">
      <div className="flex items-center">
        <p className="ml-2">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-4 text-xl font-bold text-yellow-800 hover:text-yellow-600 focus:outline-none"
      >
        &times;
      </button>
    </div>
  </div>
)
}

export default ErrorModal;
