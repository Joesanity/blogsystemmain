import { useState } from "react";
import { api } from "../utils/api";
import { useRouter } from "next/router";
import withAuth, { withAuthGetServerSideProps } from "~/components/hoc/withAuth";
import { ZodError } from "zod";

type FormData = {
  url: string;
  username: string;
  applicationPassword: string;
  companyName: string;
  phoneNumber: string;
  emailAddress: string;
  stockCategory: string;
  keywords: string;
  locations: string;
  landingPages: string[];
  blogPosts: string[];
  blogAmountMonthly: string;
  blogStartingDate: string;
};

const AddWebsite = () => {
  const [formData, setFormData] = useState<FormData>({
    url: "",
    username: "",
    applicationPassword: "",
    companyName: "",
    phoneNumber: "",
    emailAddress: "",
    stockCategory: "",
    keywords: "",
    locations: "",
    landingPages: [""],
    blogPosts: [""],
    blogAmountMonthly: "0",
    blogStartingDate: "",
  });

  const addWebsite = api.website.addWebsite.useMutation();
  const mutation = api.website.deleteWebsite.useMutation();

  const { data: getWebsites, isLoading, isError } = api.website.getWebsites.useQuery();

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      stockCategory: e.target.value,
    }));
  };

  const handleArrayChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    arrayName: keyof FormData,
  ) => {
    const newArray = [...(formData[arrayName] as string[])];
    newArray[index] = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [arrayName]: newArray,
    }));
  };

  const handleDelete = async (toDelete: string) => {
    if (window.confirm(`Are you sure you want to delete this website: ${toDelete}?`)) {
      mutation.mutate({ url: toDelete });
      router.reload();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form Data:", formData);
  
    const formDataToSubmit = {
      ...formData,
      blogStartingDate: formData.blogStartingDate ? formData.blogStartingDate : "null",
    };
  
    console.log("Form Data to Submit:", formDataToSubmit);
  
    try {
      await addWebsite.mutateAsync(formDataToSubmit);
      alert("Website added successfully!");
      router.reload();
    } catch (error: unknown) {
      console.error("Error adding website:", error);
  
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(e => `${e.path.join(' > ')}: ${e.message}`).join(", ");
        alert("Validation Error: " + errorMessages);
      } else if (error instanceof Error && error.message && error.cause instanceof ZodError) {
        const zodError = error.cause as ZodError;
        const errorMessages = zodError.errors.map(e => `${e.path.join(' > ')}: ${e.message}`).join(", ");
        alert("Validation Error: " + errorMessages);
      } else if (error instanceof Error) {
        alert("Failed to add website. " + error.message);
      } else {
        alert("Failed to add website. An unknown error occurred.");
      }
    }
  };
  

  const stockCategoryMapping = {
    Abroad: 1,
    Agriculture: 2,
    Aircon: 3,
    Animals: 4,
    Appliances: 5,
    Architects: 6,
    Asbestos: 7,
    Blinds: 8,
    Caravans: 9,
    Care: 10,
    Carpentry: 11,
    Cleaning: 12,
    Therapy: 13,
    Drainage: 14,
    Alcohol: 15,
    Education: 16,
    Electrical: 17,
    Engineering: 18,
    Fencing: 19,
    Flooring: 20,
    Construction: 21,
    Housing: 22,
    Landscaping: 23,
    Locksmith: 24,
    Massages: 25,
    Office: 26,
    Decorating: 27,
    Pests: 28,
    Plastering: 29,
    Heating: 30,
    Removals: 31,
    Roofing: 32,
    Security: 33,
    Steelworks: 34,
    Tiling: 35,
    Treatments: 36,
    Trees: 37,
  };

  return (
    <div className="flex flex-row p-4">
      <div className="mr-16 min-w-64 max-w-md">
        <h1 className="mb-4 text-2xl font-bold">Add Website</h1>
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="text"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="URL"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-300 focus:outline-none focus:ring"
          />
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-300 focus:outline-none focus:ring"
          />
          <input
            type="text"
            name="applicationPassword"
            value={formData.applicationPassword}
            onChange={handleChange}
            placeholder="Application Password"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-300 focus:outline-none focus:ring"
          />
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Company Name"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-300 focus:outline-none focus:ring"
          />
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Phone Number"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-300 focus:outline-none focus:ring"
          />
          <input
            type="email"
            name="emailAddress"
            value={formData.emailAddress}
            onChange={handleChange}
            placeholder="Email Address"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-300 focus:outline-none focus:ring"
          />
          <select
            name="stockCategory"
            value={formData.stockCategory}
            onChange={handleSelectChange}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-300 focus:outline-none focus:ring"
          >
            <option value="" disabled>Select Stock Category</option>
            {Object.keys(stockCategoryMapping).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="keywords"
            value={formData.keywords}
            onChange={handleChange}
            placeholder="Keywords"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-300 focus:outline-none focus:ring"
          />
          <input
            type="text"
            name="locations"
            value={formData.locations}
            onChange={handleChange}
            placeholder="Locations"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-300 focus:outline-none focus:ring"
          />
          <input
            type="number"
            name="blogAmountMonthly"
            value={formData.blogAmountMonthly}
            onChange={handleChange}
            placeholder="Amount of Blogs Completed"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-300 focus:outline-none focus:ring"
          />
          <input
            type="date"
            name="blogStartingDate"
            value={formData.blogStartingDate}
            onChange={handleChange}
            placeholder="Starting Blog Date"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-300 focus:outline-none focus:ring"
          />
          <div>
            <h3 className="mb-2 text-lg font-semibold">Landing Pages</h3>
            {formData.landingPages.map((url, index) => (
              <input
                key={index}
                type="text"
                value={url}
                onChange={(e) => handleArrayChange(e, index, "landingPages")}
                placeholder="Landing Page URL"
                className="mb-2 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-300 focus:outline-none focus:ring"
              />
            ))}
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold">Blog Posts</h3>
            {formData.blogPosts.map((title, index) => (
              <input
                key={index}
                type="text"
                value={title}
                onChange={(e) => handleArrayChange(e, index, "blogPosts")}
                placeholder="Blog Post Title"
                className="mb-2 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-300 focus:outline-none focus:ring"
              />
            ))}
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-500 px-4 py-2 text-white shadow-sm hover:bg-blue-600 focus:border-blue-700 focus:outline-none focus:ring"
          >
            Add Website
          </button>
        </form>
      </div>
      <div className="w-full">
        <h2 className="mb-4 text-2xl font-bold">Websites Connected:</h2>
        {isLoading && <p>Loading Websites</p>}
        {isError && <p>Error Getting Websites</p>}
        {getWebsites && (
          <div className="overflow-x-auto w-[100%]">
            <table className="min-w-full divide-y divide-gray-200 ">
              <thead className="bg-gray-50 min-w-full">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Company Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    URL
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 text-center" colSpan={3}>
                    Options
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {getWebsites.map((data, index) => (
                  <tr key={index}>
                    <td className="break-all px-6 py-4 text-sm text-gray-500">
                      {data.companyName}
                    </td>
                    <td className="break-all px-6 py-4 text-sm text-gray-500">
                      {data.url}
                    </td>
                    <td className="break-all px-6 py-4 text-sm text-white bg-blue-700 text-center cursor-pointer" onClick={() => router.push(`/website-details?url=${data.url}`)}>Details</td>
                    <td className="break-all px-6 py-4 text-sm text-white bg-purple-700 text-center cursor-pointer" onClick={() => router.push(`/edit-website?url=${data.url}`)}>Edit</td>
                    <td className="break-all px-6 py-4 text-sm text-white bg-red-600 text-center cursor-pointer" onClick={() => handleDelete(data.url)}>Delete</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Ensure to export the getServerSideProps function
export const getServerSideProps = withAuthGetServerSideProps();

export default AddWebsite;
