import Button from "@/app/components/ui/button";
import Input from "@/app/components/ui/input";


const PatientVerification: React.FC = () => {
  return (
    <div className="flex justify-center items-center bg-linear-to-br from-purple-200 to-purple-400 py-6 px-4 rounded">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-6xl">
        <h2 className="text-3xl font-bold mb-6 text-purple-700 text-center">
          Patient Verification
        </h2>

        <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Column 1 */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Lab No.
              </label>
              <Input type="text" className="border-gray-300" />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Patient Name
              </label>
              <Input
                type="text"
                placeholder="Enter patient name"
                className="border-gray-300"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                CNIC
              </label>
              <Input
                type="text"
                placeholder="Enter CNIC Number"
                className="border-gray-300"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="Enter patient email"
                className="border-gray-300"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Date From
              </label>
              <input
                type="datetime-local"
                className="border border-gray-300 rounded p-2 w-full outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Test Code
              </label>
              <Input type="text" placeholder="Code" className="border-gray-300" />
            </div>

            
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Patient No.
              </label>
              <Input type="text" className="border-gray-300" />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Father / Husband Name
              </label>
              <Input
                type="text"
                placeholder="Enter name"
                className="border-gray-300"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Blood Group
              </label>
              <Input
                type="text"
                placeholder="e.g. O+"
                className="border-gray-300"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Mobile Number
              </label>
              <Input
                type="text"
                placeholder="Enter phone number"
                className="border-gray-300"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Date To
              </label>
              <input
                type="datetime-local"
                className="border border-gray-300 rounded p-2 w-full outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Test Name
              </label>
              <Input
                type="text"
                placeholder="Enter test name"
                className="border-gray-300"
              />
            </div>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-4">
            

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Patient Age
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Age"
                  className="border-gray-300"
                />
                <select className="px-3 py-2 border border-gray-300 rounded outline-none">
                  <option>Years</option>
                  <option>Months</option>
                  <option>Days</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Gender
              </label>
              <select className="px-3 py-2 border border-gray-300 rounded w-full outline-none">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Doctor Name
              </label>
              <Input
                type="text"
                placeholder="Enter referring doctor"
                className="border-gray-300"
              />
            </div>

             <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Payment Type
              </label>
              <select className="px-3 py-2 border border-gray-300 rounded w-full outline-none">
                <option>Balance</option>
                <option>Dues Recieved</option>
                <option>Paid</option>
                <option>Discounted</option>
                <option>FOC</option>
               
              </select>
            </div>

            <div className="mt-1">
              <label className="block text-gray-700 font-semibold mb-1">
                Patient#
              </label>
              <select className="px-3 py-2 border border-gray-300 rounded w-full outline-none">
                <option>Patient Name</option>
                <option>Registration Data</option>
                <option>Refrance</option>
              </select>
            </div>

            <div className="mt-4 flex ">
              <Button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition"
              >
                Search
              </Button>
               <Button
               
                className="w-full py-3  hover:bg-red-600 hover:text-white font-semibold rounded-lg shadow-md transition border-gray-300"
              >
                Clear
              </Button>
            </div>

            
          </div>

          <div>
            <Button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition"
              >
                Update
              </Button>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default PatientVerification;
