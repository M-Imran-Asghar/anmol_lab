export default function SUmmaryPage() {
  return (
    <div className="flex justify-center items-center bg-linear-to-br from-purple-200 to-purple-400 py-6 px-4 rounded">
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-2xl w-full">
        <h2 className="text-lg font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">Generate Report Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-600">Start Date & Time</label>
            <input 
              type="datetime-local" 
              defaultValue="2025-11-24T00:00" 
              className="h-11 px-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-600">End Date & Time</label>
            <input 
              type="datetime-local" 
              defaultValue="2025-11-24T23:59" 
              className="h-11 px-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t border-slate-100">
           <button 
             
             className="bg-purple-600 text-white px-8 py-2.5 text-sm font-bold rounded-lg shadow hover:bg-purple-700 hover:shadow-md transition-all duration-200 transform active:scale-95 flex items-center gap-2"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             Run Summary
           </button>
        </div>
      </div>
    </div>
  )
}