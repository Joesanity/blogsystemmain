import Link from "next/link";
import Image from "next/image";
import { api } from "~/utils/api";
import router from "next/router";
import { useState } from "react";
import withAuth, { withAuthGetServerSideProps } from "~/components/hoc/withAuth";

function ManageBlogs() {
  const {
    data: websites,
    isLoading,
    isError,
  } = api.website.getWebsites.useQuery();

  const generateBlogPostMutation = api.generate.generateBlogPost.useMutation();
  const [loadingWebsiteId, setLoadingWebsiteId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const calculateRequiredBlogs = (startDate: string, monthlyAmount: number, blogsComplete: number) => {
    const start = new Date(startDate);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
    const totalBlogsNeeded = (monthsDiff + 1) * monthlyAmount; // +1 to include the current month
    return totalBlogsNeeded - blogsComplete;
  };

  const handleGenerateBlogPost = async (website: any) => {
    if (!website.keywords || !website.stockCategory || !website.locations || !website.phoneNumber || !website.emailAddress || !website.companyName) {
      alert("Missing required information for the website.");
      return;
    }

    const requiredBlogs = calculateRequiredBlogs(website.blogStartingDate, parseInt(website.blogAmountMonthly, 10), website.blogsComplete.length);
    if (requiredBlogs <= 0) {
      alert("No blogs need to be generated for this website.");
      return;
    }

    setLoadingWebsiteId(website.id.toString());

    try {
      for (let i = 0; i < requiredBlogs; i++) {
        await generateBlogPostMutation.mutateAsync({
          websiteId: website.id,
          keywords: website.keywords,
          stockCategory: website.stockCategory,
          locations: website.locations,
          phoneNumber: website.phoneNumber,
          emailAddress: website.emailAddress,
          companyName: website.companyName,
        });
      }
      alert("Blog posts generated and added to review!");
      router.reload();
    } catch (error) {
      console.error("Failed to generate blog post:", error);
      alert("Failed to generate blog post. Please try again.");
    } finally {
      setLoadingWebsiteId(null);
    }
  };

  const handleRunAllBlogPosts = async () => {
    if (!websites) return;

    setIsRunningAll(true);
    setProgress(0);

    const totalWebsites = websites.length;
    for (let i = 0; i < totalWebsites; i++) {
      const website = websites[i];
      if (!website) continue; // Check if website is undefined

      try {
        const requiredBlogs = calculateRequiredBlogs(website.blogStartingDate, parseInt(website.blogAmountMonthly, 10), website.blogsComplete.length);
        for (let j = 0; j < requiredBlogs; j++) {
          await generateBlogPostMutation.mutateAsync({
            websiteId: website.id,
            keywords: website.keywords,
            stockCategory: website.stockCategory,
            locations: website.locations,
            phoneNumber: website.phoneNumber,
            emailAddress: website.emailAddress,
            companyName: website.companyName,
          });
        }
        setProgress(((i + 1) / totalWebsites) * 100);
      } catch (error) {
        console.error(`Failed to generate blog post for ${website.url}:`, error);
      }
    }

    setIsRunningAll(false);
    router.reload();
  };

  return (
    <div className="px-8 py-8">
      <div className="flex flex-row gap-10 py-8 items-center">
        <h2 className="text-2xl font-bold">Blog Manager</h2>
        {!isRunningAll && (
          <button
            onClick={handleRunAllBlogPosts}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Run All Blog Posts
          </button>
        )}
      </div>
      {isRunningAll && (
        <div className="w-full bg-gray-200 h-6 rounded relative mb-4">
          <div
            className="bg-purple-700 h-6 rounded"
            style={{ width: `${progress}%` }}
          ></div>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-sm font-bold">
            {Math.round(progress)}%
          </div>
        </div>
      )}
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error Occurred</div>}
      {websites && (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Total Blogs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Monthly Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Starting Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Blogs to Review
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Blogs Complete
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {websites?.map((website) => (
              <tr key={website.id}>
                <td className="break-all px-6 py-4 text-sm text-gray-500">
                  {website.url}
                </td>
                <td className="break-all px-6 py-4 text-sm text-gray-500">
                  {website.blogNoTotal}
                </td>
                <td className="break-all px-6 py-4 text-sm text-gray-500">
                  {website.blogAmountMonthly}
                </td>
                <td className="break-all px-6 py-4 text-sm text-gray-500">
                  {formatDate(website.blogStartingDate)}
                </td>
                <td className="break-all px-6 py-4 text-sm text-gray-500">
                  {website.blogsToReview.length}
                </td>
                <td className="break-all px-6 py-4 text-sm text-gray-500">
                  {website.blogsComplete.length}
                </td>
                <td className="break-all px-6 py-4 text-sm text-gray-500">
                  <button
                    onClick={() => handleGenerateBlogPost(website)}
                    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                    disabled={loadingWebsiteId === website.id.toString()}
                  >
                    {loadingWebsiteId === website.id.toString() ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.963 7.963 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      "Generate Blog"
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export const getServerSideProps = withAuthGetServerSideProps();

export default withAuth(ManageBlogs);
