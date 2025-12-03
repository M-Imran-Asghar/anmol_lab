import Button from "@/app/components/ui/button";
import Input from "@/app/components/ui/input";

const PatientRegistration: React.FC = () => {
  return (
    <div className="flex justify-center items-center bg-linear-to-br from-purple-200 to-purple-400 py-6 px-4 rounded">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-6xl">
        <h2 className="text-3xl font-bold mb-6 text-purple-700 text-center">
          Patient Registration
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
                From
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

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Sample Received
              </label>
              <select className="px-3 py-2 border border-gray-300 rounded w-full outline-none">
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Patient Address
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
                Pay Amount
              </label>
              <Input type="number" className="border-gray-300" />
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
                Your Name
              </label>
              <Input
                type="text"
                placeholder="Who took the sample?"
                className="border-gray-300"
              />
            </div>

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

            <div className="flex gap-6 mt-2">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Total Amount
                </label>
                <p className="font-medium">Rs: 1200/-</p>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Due Amount
                </label>
                <p className="font-medium">Rs: 1000/-</p>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Sample Required
              </label>
              <Input type="text" className="border-gray-300" />
            </div>

            <div className="mt-4">
              <Button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition"
              >
                Save
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientRegistration;
