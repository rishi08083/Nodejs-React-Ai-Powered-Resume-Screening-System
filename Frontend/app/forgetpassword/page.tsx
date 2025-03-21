import React from  'react';

const ForgetPassword:React.FC = () => {
   return(
    <div className="h-screen bg-gray-100 flex justify-center items-center">
    <div className="h-1/3 bg-white w-1/3 rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">Enter Your Email</h2>
      <form>
        <input
          type="email"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none"
          placeholder="Email address"
        />
        <button className='w-full bg-yellow-400 mt-4 h-9 rounded'>Enter</button>
      </form>
    
    </div>
  </div>
  )
}
export default ForgetPassword