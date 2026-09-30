import React from 'react'

export default function Button({ startIcon, endIcon, type = "default", onClick = () => { }, txt, disabled = false }) {


   const btnStyle =
   {
      link: "text-blue-800 bg-blue-100 rounded hover:text-blue px-2 py-1 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer",
      submit: "rounded-md bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500",
      default: "rounded-md bg-gray-100 py-2 px-4 text-black hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500",
   }


   return (
      <button
         type={type === "submit" ? "submit" : "button"}
         className={btnStyle[type]}
         onClick={onClick}
         disabled={disabled}
      >
         {startIcon && <span className="mr-2">{startIcon}</span>}
         {txt}
         {endIcon && <span className="ml-2">{endIcon}</span>}
      </button>
   )
}
