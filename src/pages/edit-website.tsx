import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import BackButton from "~/components/buttons/backbutton";
import { api } from "~/utils/api";
import withAuth, { withAuthGetServerSideProps } from "~/components/hoc/withAuth";

function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = searchParams.get("url") ?? "NULL";

  useEffect(() => {
    if (url === "NULL") {
      void router.push("/add-website");
    }
  }, [url, router]);

  const { data: getWebsite, isLoading, isError } = api.website.getWebsite.useQuery({ url });

  const [formData, setFormData] = useState({
    url: "",
    username: "",
    applicationPassword: "",
    companyName: "",
    phoneNumber: "",
    emailAddress: "",
    stockCategory: "",
    keywords: "",
    locations: "",
    blogAmountMonthly: "",
    blogStartingDate: "",
  });

  useEffect(() => {
    if (getWebsite) {
      setFormData(getWebsite);
    }
  }, [getWebsite]);

  const mutation = api.website.editWebsite.useMutation();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await mutation.mutateAsync(formData);
      alert("Website updated successfully");
      void router.push('/add-website');
    } catch (error) {
      alert("Error updating website");
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
    <>
      {isLoading && <h2>Searching For {url}</h2>}
      {isError && <h2>Error Finding URL</h2>}
      {getWebsite && (
        <div className="m-12 rounded-md shadow-xl px-16 py-8">
          <BackButton />
          <div className="w-1/2">
            <h1 className="mb-4 text-2xl font-bold">Change Data</h1>
            <form className="space-y-4" onSubmit={handleSubmit}>
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
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-300 focus:outline-none focus:ring"
              >
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
                placeholder="Number of Blogs Monthly"
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
              <button
                type="submit"
                className="w-full rounded-md bg-purple-700 px-4 py-2 text-white shadow-sm hover:bg-blue-600 focus:border-blue-700 focus:outline-none focus:ring"
              >
                Update Website
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export const getServerSideProps = withAuthGetServerSideProps();

export default Home;
